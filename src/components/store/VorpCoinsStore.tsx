import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Gift,
  Star,
  Lock,
  Sparkle,
} from "@phosphor-icons/react";

export function VorpCoinsStore() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Todos", icon: Package },
    { id: "experience", label: "Experiências", icon: Star },
    { id: "physical", label: "Físicos", icon: Gift },
    { id: "digital", label: "Digitais", icon: Sparkle },
    { id: "benefit", label: "Benefícios", icon: ShoppingCart },
  ];

  // Preview items (not from DB yet)
  const previewItems = [
    {
      id: "1",
      name: "Day Off Premium",
      description: "Um dia de folga extra para aproveitar como quiser",
      price: 500,
      category: "benefit",
      emoji: "🌴",
    },
    {
      id: "2",
      name: "Jantar para Dois",
      description: "Vale para jantar em restaurante premium",
      price: 800,
      category: "experience",
      emoji: "🍽️",
    },
    {
      id: "3",
      name: "Fone Bluetooth JBL",
      description: "Fone de ouvido sem fio de alta qualidade",
      price: 300,
      category: "physical",
      emoji: "🎧",
    },
    {
      id: "4",
      name: "Curso Online Udemy",
      description: "Vale para qualquer curso da plataforma Udemy",
      price: 150,
      category: "digital",
      emoji: "📚",
    },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? previewItems
      : previewItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-2 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ShoppingCart
                  weight="fill"
                  size={28}
                  className="text-amber-600"
                />
                Loja de Prêmios Vorp
              </CardTitle>
              <CardDescription>
                Troque seus Vorp Coins por prêmios incríveis
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 font-bold px-3 py-1">
              Em Breve 🚀
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Coming Soon Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="glass border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Lock size={64} className="text-amber-600" weight="duotone" />
            </motion.div>

            <h3 className="text-2xl font-black text-foreground">
              Loja em Desenvolvimento
            </h3>

            <p className="text-muted-foreground max-w-md mx-auto">
              Estamos preparando prêmios incríveis para você! Em breve você
              poderá trocar seus Vorp Coins por experiências exclusivas,
              produtos e benefícios.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkle weight="fill" className="text-amber-500" />
              <span>Continue acumulando seus Vorp Coins!</span>
              <Sparkle weight="fill" className="text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filters (Disabled) */}
      <div className="flex gap-2 flex-wrap opacity-50 pointer-events-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              disabled
              className="gap-2"
            >
              <Icon size={16} />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Preview Items Grid (Blurred/Locked) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-40 pointer-events-none blur-sm">
        {filteredItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass border-2 border-border h-full">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{item.emoji}</span>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 font-bold">
                    {item.price} 🪙
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-foreground mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <Button className="w-full" size="sm" disabled>
                  <ShoppingCart size={16} className="mr-2" />
                  Resgatar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
