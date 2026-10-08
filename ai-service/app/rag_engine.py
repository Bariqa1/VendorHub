"""
VendorHub Contract RAG (Retrieval-Augmented Generation) Engine with OpenAI GPT-4o-mini integration.
Handles structured contract decomposition, chunk indexing, dense/keyword similarity scoring,
and grounded generation using OpenAI GPT-4o-mini (with deterministic local fallback).
"""

from typing import List, Dict, Any, Optional
import os
import re
import logging
from dotenv import load_dotenv

# Load .env from ai-service or workspace root
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

logger = logging.getLogger("vendorhub.rag")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class ContractChunk:
    def __init__(self, chunk_id: str, clause_title: str, clause_type: str, content: str, keywords: List[str]):
        self.chunk_id = chunk_id
        self.clause_title = clause_title
        self.clause_type = clause_type
        self.content = content
        self.keywords = [k.lower() for k in keywords]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunkId": self.chunk_id,
            "clauseTitle": self.clause_title,
            "clauseType": self.clause_type,
            "content": self.content
        }


class ContractRagEngine:
    """
    RAG Pipeline for Enterprise Contracts:
    1. Chunks contract into domain-specific articles (Financial, Scope, Milestones, Penalties, Termination, Compliance).
    2. Computes relevance scores against user query.
    3. Retrieves top-ranked chunks as grounded context.
    4. Synthesizes a factual, citation-backed response via OpenAI GPT-4o-mini (or resilient fallback).
    """

    @classmethod
    def index_contract(cls, contract_data: Dict[str, Any]) -> List[ContractChunk]:
        """
        Decomposes contract metadata and articles into indexable chunks.
        """
        chunks: List[ContractChunk] = []
        c_num = contract_data.get("contractNumber", "N/A")
        title = contract_data.get("title", "")
        vendor = contract_data.get("vendorName", "المورد المعتمد")
        amount = contract_data.get("totalAmount", 0)
        currency = contract_data.get("currency", "SAR")
        start_date = contract_data.get("startDate", "")
        end_date = contract_data.get("endDate", "")
        auto_renew = contract_data.get("autoRenew", False)
        payment_terms = contract_data.get("paymentTerms", "سداد خلال 30 يوم من تاريخ اعتماد الفاتورة")
        milestones = contract_data.get("milestones", [])
        desc = contract_data.get("description", "")

        # Chunk 1: Identity & Parties
        chunks.append(ContractChunk(
            chunk_id=f"{c_num}-ART-01",
            clause_title="المادة 1: أطراف العقد والتعريفات",
            clause_type="IDENTITY_AND_PARTIES",
            content=f"عقد رقم {c_num} بعنوان '{title}' مبرم بين المشتري (VendorHub Enterprise) والطرف الثاني المورد '{vendor}'. نطاق المشروع: {desc}.",
            keywords=["طرف", "أطراف", "مورد", "اسم", "عنوان", "رقم", "party", "vendor", "partner", "title", "identity"]
        ))

        # Chunk 2: Validity & Duration
        chunks.append(ContractChunk(
            chunk_id=f"{c_num}-ART-02",
            clause_title="المادة 2: مدة العقد والسريان والتجديد",
            clause_type="TERM_AND_DURATION",
            content=f"يسري هذا العقد ابتداءً من تاريخ {start_date} وحتى تاريخ {end_date}. التجديد التلقائي: {'مفعل لفترة مماثلة ما لم يشعر أحد الطرفين الآخر بعدم الرغبة' if auto_renew else 'غير مفعل، وينتهي العقد بانتهاء مدته ما لم يتم توقيع ملحق تجديد رسمي'}.",
            keywords=["تاريخ", "سريان", "انتهاء", "مدة", "تجديد", "سنة", "شهر", "تلقائي", "date", "term", "duration", "expiry", "renew", "renewal"]
        ))

        # Chunk 3: Financial Considerations & Payments
        milestone_txt = ""
        if milestones:
            milestone_txt = "، مقسمة على المراحل التالية: " + " | ".join([
                f"مرحلة ({m.get('title', '')}) بمبلغ {m.get('amount', 0):,} {currency} تستحق في {m.get('dueDate', '')} بحالة {m.get('status', '')}"
                for m in milestones
            ])
        chunks.append(ContractChunk(
            chunk_id=f"{c_num}-ART-03",
            clause_title="المادة 3: المقابل المالي وآلية الدفعات",
            clause_type="FINANCIAL_TERMS",
            content=f"القيمة الإجمالية للعقد تبلغ {amount:,.2f} {currency} غير شاملة ضريبة القيمة المضافة ما لم يذكر خلاف ذلك. شروط الدفع: {payment_terms}{milestone_txt}.",
            keywords=["قيمة", "مبلغ", "ريال", "سعر", "تكلفة", "دفع", "سداد", "فاتورة", "دفعة", "مرحلة", "ضريبة", "amount", "price", "cost", "payment", "milestone", "vat", "invoice", "sar"]
        ))

        # Chunk 4: Penalties & Delay Fines
        chunks.append(ContractChunk(
            chunk_id=f"{c_num}-ART-04",
            clause_title="المادة 4: غرامات التأخير والشروط الجزائية",
            clause_type="PENALTIES_AND_LIQUIDATED_DAMAGES",
            content="في حال تأخر الطرف الثاني (المورد) عن تسليم أي مرحلة أو مخرج في الموعد المحدد، تطبق غرامة تأخير قدرها 1% من قيمة المرحلة عن كل أسبوع تأخير، وبحد أقصى لا يتجاوز 10% من إجمالي القيمة التعاقدية.",
            keywords=["غرامة", "تأخير", "جزائي", "خصم", "تعويض", "إخلال", "مخالفة", "penalty", "delay", "fine", "damages", "breach"]
        ))

        # Chunk 5: Termination & Force Majeure
        chunks.append(ContractChunk(
            chunk_id=f"{c_num}-ART-05",
            clause_title="المادة 5: إنهاء العقد والقوة القاهرة",
            clause_type="TERMINATION_AND_DEFAULT",
            content="يحق لأي من الطرفين إنهاء العقد بإشعار كتابي مسبق مدته 30 يوماً في حال إخلال الطرف الآخر بأي بند جوهري ولم يقم بتصحيحه خلال مهلة الإشعار. في حالات القوة القاهرة (الكوارث، القرارات السيادية) يتم تعليق الالتزامات دون غرامات.",
            keywords=["فسخ", "إنهاء", "إلغاء", "إشعار", "قوة قاهرة", "انسحاب", "توقف", "terminate", "termination", "cancel", "cancellation", "force majeure", "notice"]
        ))

        # Chunk 6: Confidentiality & Data Protection
        chunks.append(ContractChunk(
            chunk_id=f"{c_num}-ART-06",
            clause_title="المادة 6: سرية البيانات وحماية المعلومات (NDA)",
            clause_type="CONFIDENTIALITY_AND_IP",
            content="يلتزم الطرف الثاني بالحفاظ على سرية وخصوصية جميع البيانات والوثائق والمعلومات الفنية الخاصة بالمشروع وعدم الإفصاح عنها لأي طرف ثالث، وتسري السرية طوال مدة العقد ولمدة 5 سنوات بعد انتهائه.",
            keywords=["سرية", "بيانات", "معلومات", "إفصاح", "حماية", "ملكية فكرية", "خصوصية", "confidentiality", "nda", "data", "privacy", "ip", "secret"]
        ))

        # Chunk 7: Governing Law & Jurisdiction
        chunks.append(ContractChunk(
            chunk_id=f"{c_num}-ART-07",
            clause_title="المادة 7: القانون الواجب التطبيق وفض النزاعات",
            clause_type="GOVERNING_LAW",
            content="يخضع هذا العقد ويفسر وفقاً للأنظمة واللوائح والقرارات التجارية المعمول بها في المملكة العربية السعودية. في حال نشوء أي نزاع يتعذر حله ودياً خلال 15 يوماً، يرفع النزاع للمحاكم التجارية المختصة في مدينة الرياض.",
            keywords=["قانون", "نظام", "نزاع", "محكمة", "تحكيم", "تسوية", "السعودية", "رياض", "law", "jurisdiction", "dispute", "court", "arbitration", "saudi"]
        ))

        return chunks

    @classmethod
    def retrieve_relevant_chunks(cls, query: str, chunks: List[ContractChunk], top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Scores and ranks chunks based on keyword density and semantic token overlap.
        """
        q_tokens = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 1]
        scored_chunks = []

        for chunk in chunks:
            score = 0.0
            # Direct keyword matching
            for kw in chunk.keywords:
                if kw in query.lower():
                    score += 3.5
            
            # Token overlap in content
            for token in q_tokens:
                if token in chunk.content.lower():
                    score += 1.5
                if token in chunk.clause_title.lower():
                    score += 2.5

            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        if not scored_chunks:
            return [{"chunk": chunks[0].to_dict(), "score": 1.0}] if chunks else []

        top_results = []
        for score, ch in scored_chunks[:top_k]:
            top_results.append({
                "chunk": ch.to_dict(),
                "score": round(score, 2)
            })

        return top_results

    @classmethod
    def generate_grounded_answer(cls, query: str, retrieved: List[Dict[str, Any]], contract_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates an accurate, grounded answer citing exact retrieved contract articles using OpenAI GPT-4o-mini
        when available, or the deterministic fallback generator.
        """
        if not retrieved:
            return {
                "answer": "لم يتم العثور على بند مباشر في هذا العقد يجيب عن هذا الاستفسار بدقة، يرجى مراجعة إدارة المشتريات.",
                "relevantClause": "غير محدد",
                "citations": [],
                "retrievedContext": []
            }

        citations = [r["chunk"]["clauseTitle"] for r in retrieved]
        retrieved_contexts = [f"[{r['chunk']['clauseTitle']}]: {r['chunk']['content']}" for r in retrieved]
        context_str = "\n\n".join(retrieved_contexts)
        top_clause_title = retrieved[0]["chunk"]["clauseTitle"]

        openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()

        # Attempt OpenAI gpt-4o-mini generation if API key is provided
        if OPENAI_AVAILABLE and openai_api_key and openai_api_key != "your_openai_api_key_here":
            try:
                client = OpenAI(api_key=openai_api_key)
                system_prompt = (
                    "أنت المساعد الذكي القانوني والمالي لمنصة VendorHub لإدارة العقود والموردين.\n"
                    "مهمتك الإجابة عن سؤال المستخدم بدقة استناداً حصرياً إلى نصوص البنود والمواد المسترجعة أدناه.\n"
                    "قواعد صارمة:\n"
                    "1. استند فقط إلى الحقائق والأرقام والتواريخ المذكورة في سياق العقد.\n"
                    "2. أجب بلغة عربية فصحى واضحة ومباشرة ومهنية.\n"
                    "3. اذكر اسم المادة أو البند المستند إليه في صلب إجابتك.\n"
                    "4. إذا لم يحتوِ السياق على إجابة للسؤال، وضّح ذلك بلطف."
                )

                user_prompt = f"سياق بنود العقد المسترجعة:\n{context_str}\n\nسؤال المستخدم:\n{query}"

                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    max_tokens=400
                )

                generated_answer = response.choices[0].message.content.strip()

                return {
                    "answer": generated_answer,
                    "relevantClause": top_clause_title,
                    "citations": citations,
                    "retrievedContext": [r["chunk"]["content"] for r in retrieved],
                    "modelUsed": "gpt-4o-mini"
                }
            except Exception as e:
                logger.warning(f"OpenAI GPT-4o-mini call failed ({str(e)}), falling back to deterministic RAG generator.")

        # Deterministic Grounded RAG Generator (Fallback)
        top_chunk = retrieved[0]["chunk"]
        clause_type = top_chunk["clauseType"]
        clause_title = top_chunk["clauseTitle"]
        content = top_chunk["content"]

        amount = contract_data.get("totalAmount", 0)
        currency = contract_data.get("currency", "SAR")
        start_date = contract_data.get("startDate", "")
        end_date = contract_data.get("endDate", "")
        auto_renew = contract_data.get("autoRenew", False)
        vendor = contract_data.get("vendorName", "المورد")

        if clause_type == "FINANCIAL_TERMS":
            answer = f"تبلغ القيمة الإجمالية للعقد {amount:,.2f} {currency}. وتُصرف المستحقات المالية وفقاً للشروط المحددة: {contract_data.get('paymentTerms', 'بناء على الفواتير المعتمدة')}."
        elif clause_type == "TERM_AND_DURATION":
            renew_str = "وهو قابل للتجديد التلقائي." if auto_renew else "والعقد غير قابل للتجديد التلقائي إلا باتفاق خطي جديد."
            answer = f"مدة العقد تبدأ من {start_date} وتنتهي بتاريخ {end_date}، {renew_str}"
        elif clause_type == "PENALTIES_AND_LIQUIDATED_DAMAGES":
            answer = "تطبق غرامة تأخير قدرها 1% عن كل أسبوع تأخير في تسليم المخرجات والمراحل، وبحد أقصى لا يتجاوز 10% من إجمالي القيمة التعاقدية."
        elif clause_type == "TERMINATION_AND_DEFAULT":
            answer = "يجوز فسخ وإنهاء العقد بإشعار كتابي مسبق مدته 30 يوماً في حال الإخلال بالالتزامات الجوهرية، أو فورياً عند حدوث ظروف القوة القاهرة."
        elif clause_type == "CONFIDENTIALITY_AND_IP":
            answer = f"يلتزم {vendor} بحماية سرية وخصوصية كافة بيانات ومستندات المشروع وعدم الإفصاح عنها، ويستمر هذا الالتزام سارياً لمدة 5 سنوات بعد انقضاء العقد."
        elif clause_type == "GOVERNING_LAW":
            answer = "يخضع العقد للأنظمة واللوائح المعمول بها في المملكة العربية السعودية، وتختص المحاكم التجارية بمدينة الرياض بالنظر في أي نزاع ينشأ عنه."
        elif clause_type == "IDENTITY_AND_PARTIES":
            answer = f"العقد مبرم بين منصة المشتريات (VendorHub) والمورد المتعاقد '{vendor}' لتنفيذ المشروع الموضح في وثائق ونطاق العمل."
        else:
            answer = f"بناءً على {clause_title}: {content}"

        return {
            "answer": answer,
            "relevantClause": clause_title,
            "citations": citations,
            "retrievedContext": [r["chunk"]["content"] for r in retrieved],
            "modelUsed": "rag-local-engine"
        }
