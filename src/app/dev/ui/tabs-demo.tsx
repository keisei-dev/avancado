
"use client";

import { useState } from "react";
import { Tabs, Tab } from "@/components/ui/tabs";

export function TabsDemo() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Tabs>
      <Tab
        label="All requests"
        count={4}
        selected={activeTab === "all"}
        onClick={() => setActiveTab("all")}
      />

      <Tab
        label="My requests"
        count={3}
        selected={activeTab === "mine"}
        onClick={() => setActiveTab("mine")}
      />

      <Tab
        label="Applied"
        count={3}
        selected={activeTab === "applied"}
        onClick={() => setActiveTab("applied")}
      />

      <Tab
        label="Lost & Found"
        count={3}
        tone="lost"
        selected={activeTab === "lost"}
        onClick={() => setActiveTab("lost")}
      />
    </Tabs>
  );
}
