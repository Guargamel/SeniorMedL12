import React from "react";
import { Outlet } from "react-router-dom";

export default function PlainLayout({ logo = "/assets/img/pharmafrnt.jpg" }) {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Image inside the card */}
                    <div className="relative hidden lg:block">
                        <img
                            src={logo}
                            alt="Login banner"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        {/* Optional: overlay for readability / style */}
                        <div className="absolute inset-0 bg-black/10" />
                    </div>

                    {/* Right: Form */}
                    <div className="flex items-center justify-center p-8">
                        <div className="w-full max-w-md">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
