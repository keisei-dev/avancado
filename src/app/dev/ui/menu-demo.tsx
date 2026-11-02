"use client";

import { IconButton } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { EllipsisVertical, SquarePen, Trash } from "lucide-react";


export function MenuDemo() {
  return (
    <Menu
      trigger={
        <IconButton aria-label="Menu">
          <EllipsisVertical size={18} />
        </IconButton>
      }
      items={[
        {
          label: "Edit",
          icon: <SquarePen size={16} />,
          onClick: () => alert("Edit clicked"),
          isDanger: false,
        },
        { label: "Delete", icon: <Trash size={16} />, onClick: () => alert("Delete clicked"), isDanger: true },
      ]}
    />
  );
}
