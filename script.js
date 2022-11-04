$(document).ready(async () => {
  class Quiz {
    constructor() {
      this.init();
      this.quizQuestions = [];
      this.currentQuestionIndex = -1;
    }

    async init() {
      this.bindUI();
      const { questions } = await this.fetchQuestions();
      this.questions = questions.map((question) => new Question(question));
      this.render();
    }

    bindUI() {
      this.uiPopUp = $('.popup');
      this.uiMainContainer = $('.ques-main');
      this.uiContainer = this.uiMainContainer.find('.container');
      this.uiNoAnswerSelected = this.uiMainContainer.find('.no-answer-info');

      this.uiPopUp.find('.close').on('click', () => {
        this.uiPopUp.fadeOut();
        this.showNextQuestion();
      });
    }

    render() {
      this.quizQuestions = this.shuffleQuestions();
      this.showNextQuestion();
    }

    showNextQuestion() {
      this.currentQuestionIndex = this.currentQuestionIndex + 1;
      if (this.currentQuestionIndex === this.questionsLength) {
        return;
      }

      this.appendQuestion(this.quizQuestions[this.currentQuestionIndex]);
    }

    appendQuestion(question) {
      this.uiContainer.find('.ques-content').remove();
      const questionUi = getQuestionTemplate(question);
      var thisContext = this;
      questionUi.find('input').on('change', function () {
        thisContext.uiNoAnswerSelected.hide();
        question.toggleAnswers($(this).val());
      });

      questionUi.find('[type="submit"]').on('click', function () {
        thisContext.checkForAnswer(question);
      });
      this.uiContainer.append(questionUi);
    }

    checkForAnswer(question) {
      var thisContext = this;
      if (!question.answerSelected) {
        thisContext.uiNoAnswerSelected.show();
        return false;
      }

      this.uiPopUp.fadeIn();
      this.uiPopUp
        .find('h2 span')
        .text(question.isRightAnswer ? 'Correct !' : 'Wrong !');
    }

    shuffleQuestions() {
      const { questions } = this;
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      return questions;
    }

    async fetchQuestions() {
      return new Promise((success, reject) => {
        $.ajax({
          dataType: 'json',
          url: '/data.json',
          success: success,
          error: reject,
        });
      });
    }

    get questionsLength() {
      return this.questions.length;
    }
  }

  class Question {
    constructor({
      QuestionNo,
      Question,
      category,
      quesType,
      Answer,
      options = [],
    }) {
      this.questionNo = QuestionNo;
      this.question = Question;
      this.quesType = quesType;
      this.answer = Answer;
      this.options = options;

      this.category = category;

      this.selectedAnswers = [];
    }

    toggleAnswers(answer) {
      if (this.isMCQ) {
        this.selectedAnswers = [answer];
      } else {
        if (this.selectedAnswers.includes(answer)) {
          this.selectedAnswers = this.selectedAnswers.filter(
            (value) => value !== answer
          );
        } else {
          this.selectedAnswers = [...this.selectedAnswers, answer];
        }
      }

      console.log(this.selectedAnswers);
    }

    get isMCQ() {
      return this.quesType === 'mcq';
    }

    get answerSelected() {
      return !!this.selectedAnswers.length;
    }

    get isRightAnswer() {
      if (this.isMCQ) {
        return this.selectedAnswers[0] === this.answer;
      }

      const answers = this.answer.split(',');
      return (
        answers.length ===
        this.selectedAnswers.filter((answer) => answers.includes(answer)).length
      );
    }
  }

  const quiz = new Quiz();

  const getQuestionTemplate = (question) => {
    console.log(question);
    const { question: title, questionNo, options = [], isMCQ } = question;
    const quesContent = $('<div />').addClass('ques-content');
    quesContent.html(`
      <h3>${title}</h3>
      <p class="ques-info">
        <span class="info-icon">🛈</span>
        Select the correct option and submit.
      </p>
      <div class="select-ques">
        ${options
          .map(
            (option, idx) =>
              `<p>
            <label for="${option}">
              <input type="${
                isMCQ ? 'radio' : 'checkbox'
              }" id="${option}" name="${questionNo}" value="${idx + 1}" />
              <span class="checkbox-button__control"></span>
              ${option}
            </label>
          </p>`
          )
          .join('')}
        <p>
          <input type="submit" class="submit-btn" />
        </p>
      </div>
    `);
    return quesContent;
  };
});
