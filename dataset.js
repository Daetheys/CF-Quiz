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
					text: "You are going to be presented with different questions. For each of these <b>questions</b>, you'll have to provide an answer. These questions can take different formats : you can have the question directly asked, with an example or an initial start to your answer to help you structure it. Feel free to take as much time and space as you need to answer the questions. If you do additional computations please write them in the form.",
					type: "regular",
					variables: [],
				},
				{
					text: 'Please note that (very) poor quality answers, such as those composed of random characters (resulting in a nonsensical sentence) or consisting in a single repeated character  (to meet input length requirements) will potentially lead to a rejection of your submission.',
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
			"title": "sControl",
			"text": "Andie is a mechanical engineer by training. During college, Andie used to collect minerals and cristals, as a hobby. Ten years later, which of these two scenarios is more probable ?",
			"id": 1,
			"type": "multiple",
			"oldTitle": "sControl",
			"entered": [''],
			"answers":["Andie is a consultant for the British Museum","Andie is a consultant for the British Museum and builds model airplanes as a hobby"],
			"correct": "",
			"oldId": 1,
			"cond": "control",
			"dilemma": ""
		}*/
	]
}	