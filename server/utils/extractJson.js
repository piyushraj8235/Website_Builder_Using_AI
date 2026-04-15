const extractJson = async (text) => {
    if (!text) {
        return null
    }

    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const firstBrace = cleaned.indexOf('{')
    const closeBrace = cleaned.lastIndexOf('}')

    if (firstBrace === -1 || closeBrace === -1) return null

    const jsonString = cleaned.slice(firstBrace, closeBrace + 1)

    // extra safety: prevent parsing empty string
    if (!jsonString) return null

    try {
        return JSON.parse(jsonString)
    } catch (error) {
        console.error("Invalid JSON:", error.message)
        return null
    }
}

export default extractJson