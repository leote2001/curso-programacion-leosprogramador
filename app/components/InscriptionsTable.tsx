/*eslint-disable*/
"use client";

import { tr } from "zod/locales";

interface InscriptionsTableProps {
    inscriptionsArray: any[]; 
}
export default function InscriptionsTable({inscriptionsArray}: InscriptionsTableProps) {
    return (
        <>
        <h2>Inscripciones</h2>
        <table>
                <thead>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>State</th>
                <th>Expires</th>
            </tr>
            </thead>
            <tbody>
            {inscriptionsArray.map(i => (
                <tr key={i._id}>
                    <td>{i.fullName}</td>
                    <td>{i.email}</td>
                    <td>{i.paymentStatus}</td>
                    <td>{i.expiresAt}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </>
    );
}