import RequestErrorResponse from "../db/response/RequestErrorResponse";
import SuggestionService from "../service/SuggestionService";
import Response from "../db/response/Response";
import { Transporter } from "nodemailer";
import ServerErrorResponse from "../db/response/ServerErrorResponse";

export class SuggestionHandler {
  private suggestionService: SuggestionService;

  constructor(suggestionService: SuggestionService) {
    this.suggestionService = suggestionService;
  }

  public async addSuggestion(body: any): Promise<Response<any>> {
    if (!body.campus) {
      return new RequestErrorResponse("Campus is required", 400);
    }
    if (!body.suggestion) {
      return new RequestErrorResponse("Suggestion is required", 400);
    }

    return this.suggestionService.addSuggestion(body.campus, body.suggestion);
  }

  public async emailSuggestionList(transporter: Transporter): Promise<Response<any>> {
    transporter.verify(function (error, success) {
      if (error) {
        return new ServerErrorResponse(error.message, 500);
      }
    });

    return await this.suggestionService.emailSuggestionList(transporter);
  }
}
