/**
 * Percy Memory Cloudflare Worker
 * Secure API for accessing memory from anywhere
 * 
 * Auth: X-API-Key header required
 * Endpoints:
 *   GET  /memory          - Get all memory
 *   GET  /memory/:key     - Get specific key
 *   POST /memory          - Set memory (JSON body)
 *   GET  /search?q=query  - Search memory
 */

export interface Env {
  percy_memory: KVNamespace;
  API_KEY: string;
}

// Auth check
function authenticate(request: Request, env: Env): boolean {
  const providedKey = request.headers.get("X-API-Key");
  return providedKey === env.API_KEY;
}

// CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "X-API-Key, Content-Type",
  };
}

// 401 response
function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: corsHeaders(),
  });
}

// 404 response
function notFound() {
  return new Response("Not Found", {
    status: 404,
    headers: corsHeaders(),
  });
}

// Get all memory
async function getAllMemory(env: Env): Promise<Response> {
  const keys = await env.percy_memory.list();
  const memory: Record<string, any> = {};
  
  for (const key of keys.keys) {
    const value = await env.percy_memory.get(key.name);
    if (value) {
      memory[key.name] = JSON.parse(value);
    }
  }
  
  return new Response(JSON.stringify(memory, null, 2), {
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

// Get specific memory key
async function getMemoryKey(key: string, env: Env): Promise<Response> {
  const value = await env.percy_memory.get(key);
  
  if (!value) {
    return notFound();
  }
  
  return new Response(value, {
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

// Set memory
async function setMemory(request: Request, env: Env): Promise<Response> {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    
    if (!body.key || body.value === undefined) {
      return new Response("Missing key or value", { 
        status: 400,
        headers: corsHeaders() 
      });
    }
    
    await env.percy_memory.put(body.key, JSON.stringify(body.value));
    
    return new Response(JSON.stringify({ success: true, key: body.key }), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Invalid JSON: " + String(e), { 
      status: 400,
      headers: corsHeaders() 
    });
  }
}

// Search memory (simple keyword)
async function searchMemory(query: string, env: Env): Promise<Response> {
  const keys = await env.percy_memory.list();
  const results: Array<{key: string, matches: string[]}> = [];
  const queryLower = query.toLowerCase();
  
  for (const key of keys.keys) {
    const value = await env.percy_memory.get(key.name);
    if (value && value.toLowerCase().includes(queryLower)) {
      const parsed = JSON.parse(value);
      results.push({
        key: key.name,
        matches: [value.substring(0, 200)] // First 200 chars as preview
      });
    }
  }
  
  return new Response(JSON.stringify({ query, results }), {
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

// Main handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    
    // Auth check (skip for now if no API_KEY set)
    if (env.API_KEY && !authenticate(request, env)) {
      return unauthorized();
    }
    
    const url = new URL(request.url);
    const path = url.pathname;
    const searchParams = url.searchParams;
    
    // Route: GET /memory
    if (request.method === "GET" && path === "/memory") {
      return getAllMemory(env);
    }
    
    // Route: GET /memory/:key
    if (request.method === "GET" && path.startsWith("/memory/")) {
      const key = path.slice("/memory/".length);
      return getMemoryKey(key, env);
    }
    
    // Route: POST /memory
    if (request.method === "POST" && path === "/memory") {
      return setMemory(request, env);
    }
    
    // Route: GET /search
    if (request.method === "GET" && path === "/search") {
      const query = searchParams.get("q");
      if (!query) {
        return new Response("Missing search query", { 
          status: 400,
          headers: corsHeaders() 
        });
      }
      return searchMemory(query, env);
    }
    
    // Health check
    if (request.method === "GET" && path === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }
    
    return notFound();
  },
};
