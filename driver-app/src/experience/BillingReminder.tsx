import React, { useEffect, useState } from "react";
import { Modal, View, AppState } from "react-native";
import { driverApi } from "../api";
import { useSession, useTrip } from "./session";
import { usePreferences } from "./preferences";
import { Button, Card, Label, Screen } from "./ui";
const dismissed = new Set<string>();
export default function BillingReminder() {
  const s = useSession(),
    trip = useTrip(),
    { t, colors } = usePreferences();
  const owner = s.profile!.driver.id,
    company = s.profile!.company.id;
  const [notice, setNotice] = useState<{
    notice_key: string;
    company_id: number;
  } | null>(null);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const next = await driverApi.billingNotice(owner);
        if (alive) setNotice(next && next.company_id === company ? next : null);
      } catch {
        /* Billing reminders never break trip or session flows. */
      }
    }
    if (!trip.trip) void load();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active" && !trip.trip) void load();
    });
    return () => {
      alive = false;
      listener.remove();
    };
  }, [owner, company, trip.trip]);
  const visible =
    !!notice && !trip.trip && !dismissed.has(owner + ":" + notice.notice_key);
  function close() {
    if (notice) dismissed.add(owner + ":" + notice.notice_key);
    setNotice(null);
  }
  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={close}
    >
      <Screen>
        <View style={{ paddingTop: 40, gap: 20 }}>
          <Card>
            <Label bold size={24}>
              {t("billingTitle")}
            </Label>
            <Label>{t("billingNotice")}</Label>
            <Button label={t("billingDismiss")} onPress={close} />
          </Card>
          <View
            style={{
              height: 4,
              width: 40,
              borderRadius: 4,
              backgroundColor: colors.accent,
              alignSelf: "center",
            }}
          />
        </View>
      </Screen>
    </Modal>
  );
}
