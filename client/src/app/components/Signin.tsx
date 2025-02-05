"use client";
import useAuth from "@/lib/hooks/use-auth";
import React, { useEffect } from "react";

const Signin = () => {

    const s = useAuth();

    useEffect(() => {
        s.init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            LOGIN
            {s.ready ? (
                !s.loggedIn ? (
                    <button
                        onClick={s.signin}
                    >
                        🎉 Sign in
                    </button>
                ) : <p>Address: {s.address as string}</p>
            ) : null}
        </div>
    );
};

export default Signin;
