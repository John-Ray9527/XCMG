# 矿擎智鉴 · 后端（FastAPI）
# 上传资料 → 抽取文本 → DeepSeek 建立知识（profile + entries）
# 功能页「点击生成」走 /chat 与 /ask 由 DeepSeek 动态生成
# 部署于 Vercel serverless（Python），DeepSeek 密钥仅存服务端环境变量 DEEPSEEK_API_KEY

import io
import json
import os
from typing import List, Optional

import requests
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader

app = FastAPI(title="矿擎智鉴 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-chat"
MAX_TEXT_CHARS = 30000

SYSTEM_PROMPT = (
    "你是一名具有 20 年经验的矿用液压挖掘机产品总体工程师，服务于「矿擎智鉴」平台。"
    "你的职责是帮助产品总体工程师理解竞品技术、形成技术洞察、辅助 300 吨级液压挖掘机的产品开发决策。"
    "回答要求：专业、工程化、给出依据、使用规范工程术语（如 pilot valve=先导阀、swing motor=回转马达、hydraulic pump=主液压泵）。"
)


# ── DeepSeek 调用 ──────────────────────────────────────────────────────────
def call_deepseek(messages: List[dict], temperature: float = 0.7, max_tokens: int = 1600, json_mode: bool = False) -> str:
    key = os.environ.get("DEEPSEEK_API_KEY")
    if not key:
        raise RuntimeError("服务端未配置 DEEPSEEK_API_KEY")
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    resp = requests.post(
        DEEPSEEK_ENDPOINT,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        json=payload,
        timeout=60,
    )
    data = resp.json()
    if resp.status_code != 200:
        raise RuntimeError(f"DeepSeek {resp.status_code}: {data.get('error', {}).get('message', '')}")
    return data["choices"][0]["message"]["content"]


def split_sections(text: str) -> dict:
    result, current, buf = {}, None, []
    headings = ("专业翻译", "技术分析", "产品开发启示")
    for line in text.split("\n"):
        s = line.strip()
        hit = next((h for h in headings if h in s), None)
        if hit:
            if current:
                result[current] = "\n".join(buf).strip()
            current, buf = hit, []
        else:
            buf.append(line)
    if current:
        result[current] = "\n".join(buf).strip()
    return result


def _parse_json(content: str) -> dict:
    c = content.strip()
    if c.startswith("```"):
        c = c.strip("`")
        if c.lstrip().startswith("json"):
            c = c.lstrip()[4:]
    start, end = c.find("{"), c.rfind("}")
    if start != -1 and end != -1 and end > start:
        c = c[start : end + 1]
    return json.loads(c)


# ── 文本抽取 ───────────────────────────────────────────────────────────────
def extract_text(filename: str, data: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        pages = []
        for p in reader.pages:
            try:
                pages.append(p.extract_text() or "")
            except Exception:
                pages.append("")
        return "\n".join(pages)
    if name.endswith((".txt", ".md", ".csv")):
        return data.decode("utf-8", errors="ignore")
    raise HTTPException(status_code=400, detail="仅支持 PDF / TXT / MD 文件")


# ── 请求模型 ───────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str = MODEL
    messages: List[Message]
    temperature: float = 0.7
    max_tokens: int = 1200


class EntryRef(BaseModel):
    id: str = ""
    system: str = ""
    source: str = ""
    page: str = ""
    original_text: str = ""
    translation: str = ""
    engineering_analysis: str = ""


class AskRequest(BaseModel):
    question: str
    entries: List[EntryRef] = []
    original_text: str = ""


# ── 路由 ───────────────────────────────────────────────────────────────────
@app.get("/")
@app.get("/api")
def health():
    return {"ok": True, "product": "矿擎智鉴 · AI 竞品资料分析工具"}


# 通用透传：功能页「点击生成」时做针对性分析
@app.post("/chat")
@app.post("/api/chat")
def chat(req: ChatRequest):
    content = call_deepseek(
        [m.model_dump() for m in req.messages],
        temperature=req.temperature,
        max_tokens=req.max_tokens,
    )
    return {"content": content}


# 核心：上传资料 → 抽取文本 → DeepSeek 建立知识（profile + entries）
@app.post("/analyze")
@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="文件为空")
    text = extract_text(file.filename or "upload.pdf", data)
    text = " ".join(text.split())[:MAX_TEXT_CHARS]
    if not text.strip():
        raise HTTPException(status_code=400, detail="未能从文件中提取到文本（可能是扫描版 PDF）")

    prompt = (
        "请阅读以下竞品技术资料文本，作为 300 吨级矿用液压挖掘机的竞品分析依据。\n\n"
        "【资料文本】\n" + text + "\n\n"
        "请严格输出一个 JSON 对象（不要输出任何其它文字），结构如下：\n"
        "{\n"
        '  "profile": {"brand": "品牌", "model": "型号", "type": "设备类型", "tonnage": "吨位等级", "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]},\n'
        '  "entries": [\n'
        '    {"system": "液压系统|动力系统|回转系统|控制系统|维护保养", "page": "页码或章节", '
        '"original_text": "从资料摘录的原文（原文为英文则保留英文）", "translation": "中文专业翻译", '
        '"engineering_analysis": "该技术方案解决什么问题（2-3句）", "development_advice": "对300吨级产品开发的启示", '
        '"technical_tags": ["英文标签"], "zh_keywords": ["中文关键词"]}\n'
        "  ]\n"
        "}\n\n"
        "要求：\n"
        "1. entries 生成 10~16 条，尽量完整覆盖液压系统、动力系统、回转系统、控制系统、维护保养五大系统；\n"
        "2. original_text 尽量忠于资料原文（英文资料保留英文，中文资料保留中文）；\n"
        "3. zh_keywords 为便于检索的中文关键词（含同义词）；\n"
        "4. 若资料未涉及某系统，可跳过该系统。"
    )

    try:
        content = call_deepseek(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=7000,
            json_mode=True,
        )
        result = _parse_json(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 分析失败：{str(e)[:200]}")

    profile = result.get("profile") or {}
    entries = result.get("entries") or []
    source = file.filename or "uploaded.pdf"
    for i, e in enumerate(entries):
        if not isinstance(e, dict):
            continue
        e.setdefault("id", f"kb-{i + 1}")
        e.setdefault("source", source)
    entries = [e for e in entries if isinstance(e, dict)]

    return {"fileName": file.filename, "profile": profile, "entries": entries}


# 检索 + 生成：前端把全部知识条目（含 id/系统/原文/翻译/分析）发来，
# 由 DeepSeek 语义选择最相关条目并完成翻译/分析/启示，彻底避免「答非所问」。
@app.post("/ask")
@app.post("/api/ask")
def ask(req: AskRequest):
    # 兼容旧路径：仅传原文时走单条生成
    if not req.entries and req.original_text.strip():
        return ask_single(req.question, req.original_text)

    if not req.entries:
        return {"entry_index": -1, "translation": "", "analysis": "", "advice": ""}

    kb_blocks = []
    for i, e in enumerate(req.entries):
        kb_blocks.append(
            f"[{i}] 系统={e.system} | 来源={e.source} | P{e.page}\n"
            f"原文：{e.original_text[:400]}\n"
            f"翻译：{e.translation[:250]}\n"
            f"技术分析：{e.engineering_analysis[:250]}"
        )
    kb = "\n\n".join(kb_blocks)

    prompt = (
        "以下是竞品资料的知识条目（每条已编号）。请先判断与用户问题最相关的一条，返回其编号，"
        "再基于该条原文完成三项任务；若确实没有相关条目则编号返回 -1。\n\n"
        f"【知识条目】\n{kb}\n\n"
        f"【用户问题】\n{req.question}\n\n"
        "请严格输出一个 JSON 对象（不要任何其它文字，确保为合法 json）：\n"
        '{"entry_index": 编号或-1, "translation": "专业翻译", "analysis": "技术分析（2-3条）", "advice": "产品开发启示"}'
    )
    try:
        content = call_deepseek(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=1600,
            json_mode=True,
        )
        r = _parse_json(content)
    except Exception:
        r = {}

    idx = r.get("entry_index", -1)
    if isinstance(idx, str):
        try:
            idx = int(idx.strip())
        except Exception:
            idx = -1
    if not isinstance(idx, int) or idx < 0 or idx >= len(req.entries):
        idx = -1

    return {
        "entry_index": idx,
        "translation": (r.get("translation") or "").strip(),
        "analysis": (r.get("analysis") or "").strip(),
        "advice": (r.get("advice") or "").strip(),
    }


def ask_single(question: str, original_text: str) -> dict:
    prompt = (
        "请针对以下竞品资料原文，结合用户问题，完成三项任务（不做全文翻译，只处理本条内容）：\n\n"
        f"【原文】\n{original_text}\n\n【用户问题】\n{question}\n\n"
        "请严格按以下三个小标题输出，每部分简洁专业：\n"
        "## 专业翻译\n（用中文工程术语准确翻译原文）\n"
        "## 技术分析\n（该技术方案解决什么问题，2-3 条）\n"
        "## 产品开发启示\n（针对 300 吨级液压挖掘机开发，输出设计关注点）"
    )
    try:
        content = call_deepseek(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ]
        )
        sections = split_sections(content)
    except Exception:
        sections = {}
    return {
        "translation": sections.get("专业翻译") or "",
        "analysis": sections.get("技术分析") or "",
        "advice": sections.get("产品开发启示") or "",
    }
