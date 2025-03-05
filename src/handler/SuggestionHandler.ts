import SuggestionService from "../service/SuggestionService";
import { Transporter } from "nodemailer";
import ServerErrorResponse from "../response/ServerErrorResponse";
import { parseRequiredFields } from "../utils/utils";

export class SuggestionHandler {
  private suggestionService: SuggestionService;

  constructor(suggestionService: SuggestionService) {
    this.suggestionService = suggestionService;
  }

  public async addSuggestion(body) {
    const requiredFields = ["campus", "suggestion"];
    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

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
