module.exports = async function ({github, context}) {
	const {status, data: {body}} = await github.rest.pulls.get({
		owner: context.repo.owner,
		repo: context.repo.repo,
		pull_number: context.issue.number
	})

	if (status !== 200 || body === null || body === undefined || typeof body !== "string") {
		return ""
	}

	const envBlockMatch = body.match(/## Testing Env(?:ironment)?\s+```.*\r?\n([^`]+?)```/i)?.[1]
	const validEnvBlock =
		envBlockMatch.trim().split(/\r?\n/)
			.map((envVar) => envVar.split("="))
			.filter(([varName]) =>
				varName.startsWith("ENABLE_") ||
				varName.startsWith("USE_") ||
				varName.startsWith("SHOW_") ||
				varName.startsWith("SUPPORT_"))
			.map((varPair) => varPair.join("="))
			.join("\n")

	console.warn(
		"Detected env block",
		validEnvBlock
	)

	return validEnvBlock ?? ""
}
