import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, subject } = await req.json();

    if (!message?.trim()) {
      return Response.json(
        { error: "سؤال خالی است." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-6-luna",
      instructions: `
تو «همراه دروس» هستی؛ یک دستیار آموزشی برای دانش‌آموزان.
درس انتخاب‌شده: ${subject}

پاسخ باید:
- فارسی و روان باشد.
- متناسب با سطح دانش‌آموز باشد.
- برای مسائل ریاضی، مراحل حل را نشان دهد.
- از توضیحات غیرضروری پرهیز کند.
- اگر سؤال مبهم است، کوتاه توضیح بده چه چیزی لازم است.
`,
      input: message,
    });

    return Response.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "ارتباط با هوش مصنوعی برقرار نشد." },
      { status: 500 }
    );
  }
}
