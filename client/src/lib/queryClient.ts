import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`) as any;
    error.status = res.status;
    error.statusText = res.statusText;
    throw error;
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const { method = "GET", body, headers = {} } = options || {};
  
  // Add admin token to Authorization header if available and accessing admin endpoints
  const adminToken = localStorage.getItem('adminToken');
  const isAdminRequest = url.includes('/api/admin/');
  
  const requestHeaders = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(isAdminRequest && adminToken ? { "Authorization": `Bearer ${adminToken}` } : {}),
    ...headers,
  };
  
  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
