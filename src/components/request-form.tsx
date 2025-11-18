"use client";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray, Controller } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";


export const requestSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
  method: z.string(),
  headers: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    })
  ).optional(),
  body: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestFormProps {
  form: UseFormReturn<RequestFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export function RequestForm({ form, onSubmit, loading }: RequestFormProps) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "headers",
    });

    const httpMethod = form.watch('method');
    const showBody = httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH';

    return (
        <Form {...form}>
            <form onSubmit={onSubmit}>
                <Card>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                            <FormField
                                control={form.control}
                                name="method"
                                render={({ field }) => (
                                    <FormItem className="sm:w-40">
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map(method => (
                                                    <SelectItem key={method} value={method}>{method}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="https://api.example.com/data" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <Tabs defaultValue="headers" className="w-full">
                            <TabsList>
                                <TabsTrigger value="headers">Headers</TabsTrigger>
                                <TabsTrigger value="body" disabled={!showBody}>Body</TabsTrigger>
                            </TabsList>
                            <TabsContent value="headers">
                                <div className="space-y-3 pt-2">
                                    {fields.map((item, index) => (
                                        <div key={item.id} className="flex gap-2 items-center">
                                            <FormField
                                                control={form.control}
                                                name={`headers.${index}.key`}
                                                render={({ field }) => (
                                                    <Input placeholder="Key" {...field} />
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`headers.${index}.value`}
                                                render={({ field }) => (
                                                    <Input placeholder="Value" {...field} />
                                                )}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0">
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ key: '', value: '' })}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Header
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="body">
                                <FormField
                                    control={form.control}
                                    name="body"
                                    render={({ field }) => (
                                        <Textarea
                                            placeholder={showBody ? 'Enter request body (e.g., JSON)' : 'Request body is not applicable for this method'}
                                            className="font-code min-h-[200px] text-sm"
                                            disabled={!showBody}
                                            {...field}
                                        />
                                    )}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="flex justify-end p-4 md:p-6 border-t">
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Send Request
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
