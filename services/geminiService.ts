import { GoogleGenerativeAI } from "@google/generative-ai";
import type { OperationalData, TurbineType, Answers } from "../types.ts";

// Inicijalizacija Gemini klijenta
// NAPOMENA: Osiguraj da u .env fajlu imaš VITE_GEMINI_API_KEY=tvoj_kljuc
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

interface AnalysisInput {
    turbine: TurbineType | null;
    operational: OperationalData;
    answers: Answers;
    riskScore: number;
}

/**
 * Generira prompt za AI inženjera na temelju unesenih podataka.
 */
const createEngineeringPrompt = (data: AnalysisInput): string => {
    const { turbine, operational, answers, riskScore } = data;

    // Pretvaramo odgovore u čitljiv format
    const formattedAnswers = Object.entries(answers)
        .map(([key, value]) => `- Question ${key}: ${value}`)
        .join('\n');

    return `
        ACT AS: "Hydro-Prijatelj", a Senior Hydropower Risk Engineer with 30 years of experience in LCC Optimization and RCFA (Root Cause Failure Analysis).

        CONTEXT:
        You are analyzing a hydropower plant to identify the "Execution Gap" (the difference between plan and reality) and systemic risks.
        
        SYSTEM DATA:
        - Turbine Type: ${turbine ? turbine.name : 'Unknown'}
        - Description: ${turbine ? turbine.description : 'N/A'}
        - Water Head: ${operational.head} m
        - Flow Rate: ${operational.flow} m³/s
        - Power Output: ${operational.output} MW
        
        DIAGNOSTIC FINDINGS (User Answers):
        ${formattedAnswers}

        CALCULATED RISK SCORE: ${riskScore}/100

        TASK:
        Provide a concise, professional engineering assessment. Do not use markdown formatting like ** or ##, just plain text with clear paragraph breaks.
        
        STRUCTURE YOUR RESPONSE AS FOLLOWS:
        1. EXECUTIVE SUMMARY: One sentence summary of the plant's health.
        2. CRITICAL EXECUTION GAPS: Identify 2-3 specific areas where discipline or documentation is failing based on the inputs.
        3. TECHNICAL RECOMMENDATION: Specific advice on alignment (mention 0.05 mm/m), vibration monitoring, or materials.
        4. FINANCIAL IMPLICATION: Briefly mention the LCC (Life Cycle Cost) risk if not addressed.

        TONE: Professional, Authoritative, Direct, constructive.
    `;
};

/**
 * Glavna funkcija za pozivanje AI servisa.
 */
export const generateAIAnalysis = async (input: AnalysisInput): Promise<string> => {
    // 1. Sigurnosna provjera - ako nema ključa, vrati simulirani odgovor
    if (!API_KEY) {
        console.warn("Gemini API Key missing. Returning simulation.");
        return simulateAnalysis(input);
    }

    try {
        // 2. Odabir modela (koristimo gemini-pro za tekst)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 3. Generiranje prompta
        const prompt = createEngineeringPrompt(input);

        // 4. Poziv API-ja
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return "System Warning: AI Diagnostic Service is currently unavailable. Please rely on the manual Risk Index and contact AnoHub support for a detailed audit.";
    }
};

/**
 * Fallback funkcija koja generira "lažni" izvještaj ako API ključ nije postavljen.
 * Ovo osigurava da aplikacija izgleda funkcionalno i bez interneta/ključa.
 */
const simulateAnalysis = (input: AnalysisInput): string => {
    const isCritical = input.riskScore > 50;

    return `
    [SIMULATION MODE - CONNECT API KEY FOR REAL-TIME AI]

    EXECUTIVE SUMMARY:
    ${isCritical ? 'CRITICAL SYSTEM STATUS.' : 'SYSTEM STABLE WITH WARNINGS.'} Based on the ${input.turbine?.name || 'turbine'} configuration and a risk score of ${input.riskScore}, the asset is showing signs of ${isCritical ? 'accelerated degradation' : 'operational drift'}.

    CRITICAL EXECUTION GAPS:
    1. Documentation discipline appears inconsistent with the Standard of Excellence.
    2. Potential deviation from the 0.05 mm/m alignment mandate based on reported vibration/noise.

    TECHNICAL RECOMMENDATION:
    Immediate verification of shaft alignment is recommended. Implement a 7-day Acoustic Baseline recording to rule out incipient cavitation.

    FINANCIAL IMPLICATION:
    Continued operation in this state risks voiding the manufacturer warranty and increasing OPEX by up to 15% annually due to reactive maintenance.
    `;
};