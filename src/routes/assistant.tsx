// Router imports removed
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatWithAdvisor } from "@/utils/chat.functions";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "🌱 Namaste! I'm your AI Crop Advisor. I can help you with:\n\n• Crop recommendations for your region\n• Fertilizer and pest management advice\n• Stage-wise guidance based on your sowing date\n• Interpreting your experiment results\n\n**Ask me anything in your language — Hindi, Marathi, Bengali, Tamil, Telugu or English!**",
  },
];

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = newMessages
        .filter((m) => m.id !== "1")
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await chatWithAdvisor({ data: { messages: chatHistory } });
      const botMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: result.content };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "⚠️ Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30">
      <AppHeader title="AI Crop Advisor" />
      <main className="flex-1 overflow-y-auto px-4 py-4 mx-auto max-w-lg w-full">
        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}
            >
              <motion.div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "assistant" ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white" : "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600"
                )}
                whileHover={{ scale: 1.1 }}
              >
                {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card
                  className={cn(
                    "max-w-[80%] p-3 text-sm border-l-4",
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-l-green-700" 
                      : "bg-white border-l-green-300 shadow-md"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </Card>
              </motion.div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <motion.div 
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bot className="h-4 w-4" />
              </motion.div>
              <Card className="p-3 bg-white shadow-md">
                <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Loader2 className="h-5 w-5 text-green-600" />
                </motion.div>
              </Card>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </motion.div>
      </main>
      <motion.div 
        className="border-t border-green-200 bg-gradient-to-r from-white via-green-50/50 to-white px-4 py-3 mx-auto max-w-lg w-full"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="icon" className="shrink-0 border-green-200 hover:bg-green-50">
              <Mic className="h-5 w-5 text-green-600" />
            </Button>
          </motion.div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crops, fertilizer, pests..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="border-green-200 focus:border-green-500 focus:ring-green-500"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default AssistantPage;



