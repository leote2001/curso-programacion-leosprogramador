"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent } from "react";

export default function CourseEditionsStatusFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const statusSelected = searchParams.get("courseEditionStatus") ?? "";

    const changeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
        const currentValue = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (currentValue) {
            params.set("courseEditionStatus", currentValue);
        } else {
            params.delete("courseEditionStatus");
        }
        router.push(`${pathname}?${params.toString()}`);
    }
    return (
        <>
            <h2>Filtros</h2>
            <h3>Status</h3>
            <select name="statusFilter" id="statusFilter" value={statusSelected} onChange={changeStatus}>
                <option value="">Todas</option>
                <option value="upcoming">Upcoming</option>
                <option value="open">Open</option>
                <option value="active">Active</option>
                <option value="finished">Finished</option>
                <option value="canceled">Canceled</option>
            </select>
        </>
    );
}