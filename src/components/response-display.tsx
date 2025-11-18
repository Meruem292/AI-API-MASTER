"use client";

import {
  AlertCircle,
  Bot,
  CheckCircle,
  Clipboard,
  FileWarning,
} from "lucide-react";

import type { ActionResponse } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ResponseDisplayProps {
  result: ActionResponse;
}

const StatusBadge = ({ status }: { status: number }) => {
  const getBadgeClass = () => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800";
    if (status >= 300 && status < 400) return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";
    if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800";
    if (status >= 500) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800";
    return "bg-secondary";
  };
  return <Badge className={cn("text-sm", getBadgeClass())}>{status}</Badge>;
};

export function ResponseDisplay({ result }: ResponseDisplayProps) {
  const { response, analysis } = result;
  const { toast } = useToast();

  if (!response) {
    return null;
  }

  const formattedBody = typeof response.body === 'object' 
    ? JSON.stringify(response.body, null, 2) 
    : String(response.body);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedBody);
    toast({
      title: "Copied to clipboard!",
      description: "The response body has been copied.",
    });
  };

  const issuesFound = analysis?.issues && analysis.issues.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-4">
          <span>Response</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <StatusBadge status={response.status} />
            <span className="text-sm font-normal text-muted-foreground">{response.statusText}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
            <span className="font-medium">Time:</span>
            <span>{response.time}ms</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="body" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="analysis" className="relative">
              Analysis
              {issuesFound && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{analysis.issues.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="body" className="relative mt-4">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={copyToClipboard}>
              <Clipboard className="h-4 w-4"/>
            </Button>
            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto font-code text-sm">
              <code>{formattedBody}</code>
            </pre>
          </TabsContent>
          <TabsContent value="headers" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Key</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(response.headers).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="analysis" className="mt-4">
            {issuesFound ? (
              <div className="space-y-4">
                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertTitle>AI Analysis Complete</AlertTitle>
                  <AlertDescription>
                    {`The AI has identified ${analysis.issues.length} potential issue(s).`}
                  </AlertDescription>
                </Alert>
                {analysis.issues.map((issue, index) => (
                  <Alert key={index} variant="destructive">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Potential Issue #{index + 1}</AlertTitle>
                    <AlertDescription>{issue}</AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <Alert className="border-green-500/50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>No Issues Found</AlertTitle>
                <AlertDescription>
                  The AI analysis did not find any potential issues in the response.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
