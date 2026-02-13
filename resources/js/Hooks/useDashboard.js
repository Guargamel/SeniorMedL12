import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function useDashboard() {
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState({
        totalSeniors: 0,
        appUsers: 0,
        medicines: 0,
        todayDistributions: 0,
    });

    const [alerts, setAlerts] = useState([]);
    const [recentDistributions, setRecentDistributions] = useState([]);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);

                const [s, a, r] = await Promise.all([
                    apiFetch("/api/dashboard/summary"),
                    apiFetch("/api/dashboard/alerts"),
                    apiFetch("/api/dashboard/recent-distributions"),
                ]);

                if (!alive) return;

                setSummary(s);
                setAlerts(a);
                setRecentDistributions(r);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    return { loading, summary, alerts, recentDistributions };
}
