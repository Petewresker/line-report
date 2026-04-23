import liff from "@line/liff";

const authenticate = async (payload) => {
    try {
        const auth = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!auth.ok) {
            return false;
        }

        const { token } = await auth.json();
        localStorage.setItem("TU_Smart_Service JWT Token", token);
        return true;

    } catch (err) {
        console.log("Authenticated failed", err);
        return false;
    }
};

const callVerifyAPI = async () => {
    const token = localStorage.getItem("TU_Smart_Service JWT Token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
        method: "GET",
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) return null;
    return await res.json();
};

// ถ้า JWT เก่าไม่มี role ที่ต้องการ → re-auth อัตโนมัติแล้วลองใหม่ 1 ครั้ง
const verify = async (requiredRole = null) => {
    try {
        const data = await callVerifyAPI();

        if (requiredRole && data?.user?.role !== requiredRole) {
            localStorage.removeItem("TU_Smart_Service JWT Token");
            await authenticate({ idToken: liff.getIDToken() });
            return await callVerifyAPI();
        }

        return data;
    } catch (err) {
        console.log("Verify failed", err);
    }
};

export { authenticate, verify };
