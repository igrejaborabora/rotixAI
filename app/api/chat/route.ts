import { NextResponse } from "next/server";

// Ensure this route runs in the Node.js runtime (not Edge) so we can use the `mssql` package
export const runtime = "nodejs";
import { query } from "@/lib/mssql";

export async function GET() {
  return NextResponse.json({
    message: "Chat API is working!",
    timestamp: new Date().toISOString(),
    status: "ok"
  });
}

export async function POST(request: Request) {
  console.log('[/api/chat] POST request received');
  
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    console.log(`[/api/chat] Processing: ${question}`);

    // Test 1: Return immediately without any external calls
    if (question === 'test-immediate') {
      return NextResponse.json({
        answer: 'Immediate response working!',
        question,
        test: 'immediate'
      });
    }

    // Test 2: Only MSSQL (no OpenAI)
    if (question === 'test-mssql') {
      const dbRows = await query(
        `SELECT TOP 1 Description, UnitPrice FROM dbo.Vendas ORDER BY CreateDate DESC`,
        {}
      );
      return NextResponse.json({
        answer: `MSSQL working! Found: ${dbRows[0]?.Description || 'No data'}`,
        question,
        dbRecords: dbRows.length
      });
    }

    // Test 3: Only OpenAI (no MSSQL)
    if (question === 'test-openai') {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return NextResponse.json({ answer: 'OpenAI key missing', question });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "OpenAI working!"' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          answer: data.choices[0]?.message?.content || 'OpenAI response empty',
          question
        });
      } else {
        return NextResponse.json({ answer: 'OpenAI failed', question });
      }
    }

    // Stable MSSQL-powered chatbot (working version)
    const dbRows = await query(
      `SELECT TOP 3 Description, UnitPrice, CreateDate FROM dbo.Vendas WHERE Description LIKE @search ORDER BY CreateDate DESC`,
      { search: `%${question}%` }
    );

    if (dbRows.length === 0) {
      // Try broader search if no exact matches
      const words = question.split(' ').filter((word: string) => word.length > 2);
      if (words.length > 0) {
        const broadSearch = words.map((word: string) => `Description LIKE '%${word}%'`).join(' OR ');
        const broadRows = await query(`SELECT TOP 3 Description, UnitPrice FROM dbo.Vendas WHERE ${broadSearch} ORDER BY CreateDate DESC`);
        
        if (broadRows.length > 0) {
          const suggestions = broadRows.map((p: any) => `${p.Description} (€${p.UnitPrice})`).join(", ");
          return NextResponse.json({
            answer: `Não encontrei "${question}" exatamente, mas encontrei produtos similares: ${suggestions}`,
            question,
            dbRecords: broadRows.length,
            products: broadRows,
            searchType: 'broad',
            timestamp: new Date().toISOString()
          });
        }
      }
      
      return NextResponse.json({
        answer: `Não encontrei produtos relacionados com "${question}". Tente termos como "vinho", "cerveja", "agua" ou "luso".`,
        question,
        dbRecords: 0,
        suggestions: ['vinho', 'cerveja', 'agua', 'luso'],
        timestamp: new Date().toISOString()
      });
    }

    // Create intelligent response based on products found
    const productList = dbRows.map((product: any) => `${product.Description} (€${product.UnitPrice})`).join(", ");
    const avgPrice = (dbRows.reduce((sum: number, p: any) => sum + parseFloat(p.UnitPrice), 0) / dbRows.length).toFixed(2);
    
    let smartAnswer;
    if (dbRows.length === 1) {
      smartAnswer = `Encontrei: ${productList}. Este produto está disponível por €${dbRows[0].UnitPrice}.`;
    } else {
      smartAnswer = `Encontrei ${dbRows.length} produtos relacionados com "${question}": ${productList}. Preço médio: €${avgPrice}.`;
    }

    return NextResponse.json({
      answer: smartAnswer,
      question,
      dbRecords: dbRows.length,
      products: dbRows,
      averagePrice: avgPrice,
      searchType: 'exact',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error(`[/api/chat] Error:`, error);
    return NextResponse.json({ 
      error: error.message || "Internal error",
      question: request.url
    }, { status: 500 });
  }
}
