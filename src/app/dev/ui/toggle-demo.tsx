"use client";

// Preview only: Switch and ChoicePills on /dev/ui.

import { ChoicePills, Switch } from "@/components/ui/toggle";

export function ToggleDemo() {
  return (
    <div className="grid gap-6">
      <div className="divide-y divide-line">
        <Switch
          label="New messages"
          hint="Conversations with sitters and owners"
          defaultChecked
        />
        <Switch
          label="Lost pet alerts nearby"
          hint="Alerts posted in your neighbourhood"
          onChange={(checked) => console.log("Lost pet alerts:", checked)}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <ChoicePills label="Species" options={["Dog", "Cat"]} />
        <ChoicePills
          label="Vaccination"
          options={["Vaccinated", "Not yet"]}
          defaultValue="Not yet"
        />
      </div>
    </div>
  );
}
