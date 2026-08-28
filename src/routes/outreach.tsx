import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/outreach")({
  component: OutreachWorkspace,
});

function OutreachWorkspace() {
  const queryClient = useQueryClient();

  const { data: outreachMessages, isLoading } = useQuery({
    queryKey: ["outreach-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_messages")
        .select(`
          *,
          prospects (
            name,
            industry,
            pipeline_status
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("outreach_messages")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-messages"] });
      toast.success("Status updated");
    },
  });

  const copyToClipboard = (message: any) => {
    const text = `
Target: ${message.target}
Channel: ${message.channel}
Opening: ${message.opening}
Problem: ${message.problem}
Value: ${message.value}
CTA: ${message.cta}
Follow-up: ${message.follow_up}
    `.trim();
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Outreach Workspace</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prospect</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Pipeline Stage</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outreachMessages?.map((message: any) => (
            <TableRow key={message.id}>
              <TableCell>{message.prospects?.name}</TableCell>
              <TableCell>{message.prospects?.industry}</TableCell>
              <TableCell>{message.prospects?.pipeline_status}</TableCell>
              <TableCell>{message.channel}</TableCell>
              <TableCell>
                <Select
                  defaultValue={message.status}
                  onValueChange={(status) => mutation.mutate({ id: message.id, status })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Replied">Replied</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => copyToClipboard(message)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
