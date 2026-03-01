import React from "react";
import { Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/style.css";

export default function PlainLayout({ logo = "/assets/img/pharmafrnt.jpg" }) {
    return (
        <div className="main-wrapper login-body">
            <div className="login-wrapper">
                <div className="container">
                    <div className="loginbox">
                        <div>
                            <img className="img-fluid" src={logo} alt="Logo" />
                        </div>

                        <div className="login-right">
                            <div className="login-right-wrap">
                                <Outlet /> {/* 👈 this is where Login/Register shows */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
