"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { sendRequest, type ActionResponse } from "@/app/actions";
import { RequestForm, requestSchema } from "@/components/request-form";
import { ResponseDisplay } from "@/components/response-display";
import { useToast } from "@/hooks/use-toast";

type RequestFormValues = z.infer<typeof requestSchema>;

export function ApiTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActionResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: "",
    },
  });

  const onSubmit = async (data: RequestFormValues) => {
    setLoading(true);
    setResult(null);
    const response = await sendRequest(data);
    if (response.error && !response.response) { // Fatal error, no response object
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: response.error,
      });
    } else if (response.error) { // Non-fatal, e.g. AI analysis failed
      toast({
        variant: "default",
        className: "border-yellow-500/50 dark:border-yellow-500/50",
        title: "Warning",
        description: response.error,
      });
    }
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <RequestForm form={form} onSubmit={form.handleSubmit(onSubmit)} loading={loading} />
      
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Sending request...</p>
        </div>
      )}

      {!loading && result?.response && <ResponseDisplay result={result} />}
    </div>
  );
}
