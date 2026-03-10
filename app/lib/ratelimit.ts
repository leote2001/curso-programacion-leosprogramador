/*eslint-disable*/
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
export const redis = Redis.fromEnv();
export const minuteRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "cursoIntroProg/minute"
});
export const dayRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "24 h"),
    prefix: "cursoIntroProg/day"
});
export const checkRateLimit = async (ip: string) => {
    try {
        const { success: minuteSuccess, remaining: minuteRemaining, limit: minuteLimit } = await minuteRateLimit.limit(ip);
        console.log(`minuteRateLimit: ${minuteRemaining}/${minuteLimit}`);
        if (!minuteSuccess) {
            return { success: false, error: "Demasiadas solicitudes. Intenta en un minuto.", status: 429 };
        }
        const { success: daySuccess, remaining: dayRemaining, limit: dayLimit } = await dayRateLimit.limit(ip);
        console.log(`dayRateLimit: ${dayRemaining}/${dayLimit}`);
        if (!daySuccess) {
            return { success: false, error: "Demasiadas solicitudes. Intenta en 24 horas.", status: 429 };
        }
        return { success: true };
    } catch (err: any) {
        console.error("Error al chequear rate limit: ", err);
        return { success: false, error: "Error inesperado.", status: 500 };
    }
}