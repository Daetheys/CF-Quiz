export const dataset = {
	name: "Cushman",
	instructions: [

		{
			title: "Consent",
			items: [
				{
					text: `You are about to participate in a psychological research study.
					This study aims to understand how people solve short questions.
					The proposed experiments have no immediate application or clinical value, but they will allow us to improve our understanding of moral reasoning in humans. We are asking you to participate in this study because you have been recruited on the Prolific platform.`,
					type: "regular",
					variables: [],
					title: "Information for the participant"
				},
				{
					text: `During your participation in this study, we will ask you to answer several simple questionnaires and tests, which do not require any particular competence.Your internet-based participation will require approximately 10 minutes or possibly less.`,
					type: "regular",
					variables: [],
					title: "Procedure"
				},
				{
					text: `Your participation in this study is voluntary. This means that you are consenting to participate in this project without external pressure.During your participation in this project, the researcher in charge and his staff will collect and record information about you. In order to preserve your identity and the confidentiality of the data, the identification of each file will be coded, thus preserving the anonymity of your answers. We will not collect any personal data from the RISC or Prolific platforms. The researcher in charge of this study will only use the data for research purposes in order to answer the scientific objectives of the project.The data may be published in scientific journals and shared within the scientific community, in which case no publication or scientific communication will contain identifying information.`,
					type: "regular",
					variables: [],
					title: "Voluntary Participation And Confidentiality"
				},
				{
					text: "I'm 18 years old or older",
					type: "checkbox",
				},
				{
					text: "My participation in this experiment is voluntary",
					type: "checkbox",
				},
				{
					text: "I understand that my data will be kept confidential and I can stop at any time without justification",
					type: "checkbox",
				}
			],
			type: "short",
		},

		{
			title: "Instructions",
			items: [
				{
					text: "You are about to read a summary of the <b>life story</b> of some random characters. These stories will tell you about what the characters did for fun, for work, and what their training/education history was. Then, we will jump 10 years into the future and give you some ideas on what the characters are up to now. Based on this information, we will ask you to judge which of these ideas is more probable to be true.",
					type: "regular",
					variables: [],
				},
				{
					text: "We will provide you with two alternative scenarios (A and B), and using your mouse you will have to pick the one that seems more likely to you. Also, you will have to use a scrollbar right below the choices to determine in more exact terms how much likelier one option is than the other. Even if the characters are hypothetical, we want you to base your judgement in how 'realistic' the proposed scenarios are.",
					type: "regular",
					variables: [],
				},
				{
					text: 'It is important that you pay attention throughout the task. To make sure that you stay engaged, we have interspersed some very simple off-topic questions (i.e. "how much is 2+2?") between the trials. We expect you to answer these correctly, failure to do so may result in the rejection of your participation.',
					type: 'alert',
					variables: [],
					title: "Warning"
				},

				{
					text: `You've completed <variable1> item(s) so far. <a onclick="resetState()"> Reset data?</a>`,
					type: 'info',
					variables: ['currentQuestionIndex'],
				},

			],
			type: "short",
		},
		// {
		// title: "Instructions",
		// text: "Good luck!",
		// type: "short",
		// },

	],
	questions: [
		/*{
			"text":"Andie is a mechanical engineer by training. During college, Andie used to collect minerals and cristals, as a hobby. What did Andie do during college ?",
			"answers":["Andie was an orchestra conductor by training and used to collect minerals and cristals, as a hobby","Andie used to collect minerals and cristals, as a hobby"],
			"entered":0,
			"type":"single",
			"index":-1,
		},
		{
			"text":"Brook has a Masters in Astronomy. During college, Brook used to collect minerals and cristals, as a hobby. What is Brook's training ?",
			"answers":["Brook has a Masters in Astronomy","Brook has a Masters in Astronomy and is a logistics consultat for an important car company"],
			"entered":0,
			"type":"single",
			"index":-2,
		}*/
	]
}	