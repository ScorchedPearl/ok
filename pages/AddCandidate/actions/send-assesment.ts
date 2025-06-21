"use server"

export async function sendAssessment(formData: FormData) {
  // Simulate sending an assessment
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const assessmentId = formData.get("assessmentId") as string

  // In a real application, you would send the assessment link here
  console.log(`Sending assessment ${assessmentId} to ${name} (${email})`)

  return {
    success: true,
    message: `Assessment link sent to ${email}`,
  }
}

