async function generateImage(prompt, type = 'image') {

    const safePrompt = prompt
        .replace(/[<>]/g, '')
        .substring(0, 500)
        .trim();

    // Safisha maneno ya chatbot
    let cleanPrompt = safePrompt
        .replace(/rafiki/gi, '')
        .replace(/naomba/gi, '')
        .replace(/tafadhali/gi, '')
        .replace(/nitengenezee picha/gi, '')
        .replace(/tengeneza picha/gi, '')
        .replace(/generate image/gi, '')
        .replace(/create image/gi, '')
        .replace(/make image/gi, '')
        .trim();

    // Kiswahili → English (basic translator)
    let translatedPrompt = cleanPrompt;

    const translations = [
        [/mama analia/gi, "crying African mother"],
        [/mtaa wa kijijini/gi, "rural village street"],
        [/kijiji/gi, "African village"],
        [/barabara ya udongo/gi, "dirt road"],
        [/mtoto analia/gi, "crying child"],
        [/kanisa/gi, "church"],
        [/msikiti/gi, "mosque"],
        [/dar es salaam/gi, "Dar es Salaam Tanzania"],
        [/tanzania/gi, "Tanzania East Africa"],
        [/afrika/gi, "Africa"]
    ];

    translations.forEach(([sw, en]) => {
        translatedPrompt = translatedPrompt.replace(sw, en);
    });

    let enhancedPrompt;
    let negativePrompt =
        "blurry, low quality, ugly, distorted, bad anatomy, watermark, text, logo, cropped";

    if (type === 'logo') {

        enhancedPrompt =
            `professional logo design, ${translatedPrompt},
            vector logo, clean branding, white background,
            modern corporate identity`;

    } else if (type === 'design') {

        enhancedPrompt =
            `professional poster design,
            ${translatedPrompt},
            modern layout,
            high resolution,
            advertising design`;

    } else {

        enhancedPrompt =
            `${translatedPrompt},
            realistic photography,
            emotional scene,
            ultra detailed,
            natural lighting,
            professional camera,
            8k quality`;
    }

    console.log("PROMPT:", safePrompt);
    console.log("CLEAN:", cleanPrompt);
    console.log("FINAL:", enhancedPrompt);

    const form = new FormData();

    form.append("prompt", enhancedPrompt);
    form.append("negative_prompt", negativePrompt);
    form.append("model", "sd3-medium");
    form.append("output_format", "jpeg");

    form.append(
        "aspect_ratio",
        type === "logo"
            ? "1:1"
            : type === "design"
            ? "9:16"
            : "16:9"
    );

    const response = await fetch(
        "https://api.stability.ai/v2beta/stable-image/generate/sd3",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${STABILITY_KEY}`,
                Accept: "application/json"
            },
            body: form
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
    }

    const data = await response.json();

    if (!data.image) {
        throw new Error("Picha haijapatikana");
    }

    return `data:image/jpeg;base64,${data.image}`;
}
