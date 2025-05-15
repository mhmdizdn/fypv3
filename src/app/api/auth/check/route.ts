import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json(
                { isAuthenticated: false },
                { status: 401 }
            );
        }

        return NextResponse.json({
            isAuthenticated: true,
            user: session.user,
            userType: (session.user as any).userType
        });
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { isAuthenticated: false },
            { status: 500 }
        );
    }
} 