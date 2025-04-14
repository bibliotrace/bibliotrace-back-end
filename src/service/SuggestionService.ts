import DaoFactory from "../db/dao/DaoFactory";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import { Campus } from "../db/schema/Campus";
import { Suggestion } from "../db/schema/Suggestion";
import { User } from "../db/schema/User";
import Service from "./Service";
import Response from "../response/Response";

class SuggestionService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async addSuggestion(campus_name: string, suggestion_string: string) {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return new ServerErrorResponse(`Failed to get campus with name ${campus_name}`, 500);
    }

    const campus_id = campus_response.object.id;

    const suggestion: Suggestion = {
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      content: suggestion_string,
      campus_id: campus_id,
    };

    return await this.suggestionDao.create(suggestion);
  }

  public async emailSuggestionList(
    transporter
  ): Promise<Response<Campus[] | Suggestion[] | User[]>> {
    const campus_response: Response<Campus[]> = await this.campusDao.getAll();
    if (campus_response.statusCode !== 200) {
      return campus_response;
    }

    for (const campus of campus_response.object) {
      const suggestion_response: Response<Suggestion[]> =
        await this.suggestionDao.getAllByKeyAndValue("campus_id", campus.id);

      if (suggestion_response.statusCode !== 200) {
        return suggestion_response;
      }

      const suggestions = suggestion_response.object;
      const suggestions_list = suggestions.reduce(
        (output, suggestion) => output + `<li>${suggestion.content}</li>`,
        ""
      );

      const userResponse: Response<User[]> = await this.userDao.getAllByKeyAndValue(
        "campus_id",
        campus.id.toString()
      );

      if (userResponse.statusCode !== 200) {
        return userResponse;
      }

      for (const user of userResponse.object) {
        if (suggestions.length && user.email) {
          const mailOptions = {
            from: "bibliotrace@gmail.com",
            // to: user.email,
            to: "kellyko2003@gmail.com",
            subject: "Bibliotrace Suggestions",
            html: `<p>Suggestions for ${user.email}: </p><ul>${suggestions_list}</ul>`,
          };

          transporter.sendMail(mailOptions, function (error) {
            if (error) {
              return new ServerErrorResponse(error.message, 500);
            }
          });
        }
      }
    }

    return new SuccessResponse("Emailed suggestions list successfully");
  }
}

export default SuggestionService;
