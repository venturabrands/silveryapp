import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserEntitlement, hasAccess, Entitlement } from "@/lib/entitlements";

export function useEntitlement() {
  const { user } = useAuth();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [entitled, setEntitled] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setEntitled(false);
      return;
    }
    const check = async () => {
      setLoading(true);
      const ent = await getUserEntitlement(user.id);
      setEntitlement(ent);
      setEntitled(hasAccess(ent));
      setLoading(false);
    };
    check();
  }, [user]);

  return { entitlement, entitled, loading };
}
