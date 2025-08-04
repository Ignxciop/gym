import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect(redirectIfAuth: boolean) {
    const router = useRouter();
    useEffect(() => {
        function checkToken() {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token && redirectIfAuth) {
                router.replace("/dashboard");
            }
            if (!token && !redirectIfAuth) {
                router.replace("/");
            }
        }

        checkToken();

        window.addEventListener("storage", checkToken);
        return () => {
            window.removeEventListener("storage", checkToken);
        };
    }, [redirectIfAuth, router]);
}
