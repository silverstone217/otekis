"use client";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export function useOrderCountRealtime(initialCount: number) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const pusher = new Pusher(process.env.PUSHER_KEY!, {
      cluster: process.env.PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("orders-channel");
    channel.bind("order-count-updated", (data: { count: number }) => {
      setCount(data.count);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  return count;
}
