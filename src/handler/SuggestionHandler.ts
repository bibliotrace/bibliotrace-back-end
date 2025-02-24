import RequestErrorResponse from "../db/response/RequestErrorResponse";
import SuggestionService from "../service/SuggestionService";
import { Transporter } from "nodemailer";
import ServerErrorResponse from "../db/response/ServerErrorResponse";

export class SuggestionHandler {
  private suggestionService: SuggestionService;

  constructor(suggestionService: SuggestionService) {
    this.suggestionService = suggestionService;
  }

  public async addSuggestion(body) {
    if (!body.campus) {
      return new RequestErrorResponse("Campus is required", 400);
    }
    if (!body.suggestion) {
      return new RequestErrorResponse("Suggestion is required", 400);
    }

    return this.suggestionService.addSuggestion(body.campus, body.suggestion);
  }

  public async emailSuggestionList(transporter: Transporter) {
    transporter.verify(function (error) {
      if (error) {
        return new ServerErrorResponse(error.message, 500);
      }
    });

    return await this.suggestionService.emailSuggestionList(transporter);
  }
}
