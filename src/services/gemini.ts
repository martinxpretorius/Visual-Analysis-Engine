import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AnalysisResult {
  session: {
    id: string;
    reference_image_id: string;
    version: number;
  };
  base_image: {
    camera: {
      angle: string;
      position: string;
      lens: string;
      framing: string;
      perspective: string;
    };
    composition: {
      foreground: string;
      midground: string;
      background: string;
      focal_point: string;
    };
    geometry: {
      architecture: {
        style: string;
        form: string;
        structure: string;
        openings: string[];
        fixed_elements: string[];
      };
    };
  };
  parameter_layers?: {
    mood?: {
      description: string;
      atmosphere: string;
      emotional_tone: string;
      confidence: "high" | "medium" | "low";
    };
    context?: {
      environment: string;
      location_type: string;
      time_of_day: string;
      weather: string;
      narrative: string;
      confidence: "high" | "medium" | "low";
    };
    materials?: Array<{
      target_element: string;
      original_material: string;
      new_material: string;
      finish: string;
      color: string;
      texture: string;
      confidence: "high" | "medium" | "low";
    }>;
    lighting?: {
      type: string;
      sources: string[];
      direction: string;
      intensity: string;
      color_temperature: string;
      shadows: string;
      confidence: "high" | "medium" | "low";
    };
  };
  rendering: {
    style: string;
    quality: string;
    effects: string[];
    post_processing: string[];
  };
  constraints: {
    preserve_camera: boolean;
    preserve_geometry: boolean;
    apply_parameters_only: boolean;
    allow_material_modifications: boolean;
    allow_lighting_modifications: boolean;
    apply_mood_context: boolean;
  };
}

export async function analyzeImages(
  referenceBase64: string,
  parameterImages: {
    mood?: string;
    context?: string;
    materials?: string;
    lighting?: string;
  }
): Promise<AnalysisResult> {
  const systemInstruction = `
You are a visual analysis engine. Your role is to reverse-engineer images into structured JSON and apply layered parameter modifications to a reference image — without altering its geometry, perspective, or composition.

---

### WORKFLOW

**Step 1 — Reference image (required)**
Analyse the reference image and populate the \`base_image\` fields. This image is immutable: its camera, geometry, and composition must never be modified.

**Step 2 — Parameter images (optional)**
Each parameter image maps to one layer: \`mood\`, \`context\`, \`materials\`, or \`lighting\`. Convert each to JSON using its corresponding schema. For uncertain or ambiguous elements, set \`"confidence": "low"\`.

**Step 3 — Merge and output**
Merge all parameter layers onto the base image JSON. Parameters modify only appearance, surface, lighting, and atmosphere. Output a single valid JSON object — no commentary, no markdown, no explanations.

---

### FALLBACK RULES

- If a parameter image is missing or not provided, omit its layer from the output entirely.
- If a parameter image is ambiguous or contradicts the reference, populate what is clear, mark the rest with \`"confidence": "low"\`, and do not infer or fabricate content.
- If no parameter images are provided, output only \`base_image\`, \`rendering\`, and \`constraints\`.

---

### STRICT RULES

1. The reference image is immutable. Never alter camera, geometry, proportions, or composition.
2. Parameters modify only: appearance, lighting, materials, atmosphere, and context.
3. Do not infer or fabricate elements not present in the provided images.
4. Confidence must be set explicitly — never omit it on ambiguous fields.
5. Output only valid JSON. No preamble, no explanation, no markdown fences.
6. If a layer has no corresponding input, omit it entirely — do not output empty or null fields.
7. The \`session.id\` and \`session.reference_image_id\` must be populated at the start of every new session to support traceability across multi-image pipelines.
`;

  const parts: any[] = [
    { text: "REFERENCE IMAGE (BASE):" },
    { inlineData: { data: referenceBase64, mimeType: "image/jpeg" } }
  ];

  if (parameterImages.mood) {
    parts.push({ text: "PARAMETER IMAGE (MOOD):" });
    parts.push({ inlineData: { data: parameterImages.mood, mimeType: "image/jpeg" } });
  }
  if (parameterImages.context) {
    parts.push({ text: "PARAMETER IMAGE (CONTEXT):" });
    parts.push({ inlineData: { data: parameterImages.context, mimeType: "image/jpeg" } });
  }
  if (parameterImages.materials) {
    parts.push({ text: "PARAMETER IMAGE (MATERIALS):" });
    parts.push({ inlineData: { data: parameterImages.materials, mimeType: "image/jpeg" } });
  }
  if (parameterImages.lighting) {
    parts.push({ text: "PARAMETER IMAGE (LIGHTING):" });
    parts.push({ inlineData: { data: parameterImages.lighting, mimeType: "image/jpeg" } });
  }

  parts.push({ text: "Perform the visual analysis and output the final merged JSON according to the schema and rules provided." });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text);
}
