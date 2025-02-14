import CampusDao from "../db/dao/CampusDao";
import SuggestionDao from "../db/dao/SuggestionDao";

import { Suggestion } from "../db/schema/Suggestion";

class SuggestionService {
  private campusDao: CampusDao;
  private suggestionDao: SuggestionDao;

  constructor(campusDao: CampusDao, suggestionDao: SuggestionDao) {
    this.campusDao = campusDao;
    this.suggestionDao = suggestionDao;
  }

  public async addSuggestion(campus_name: string, suggestion_string: string) {
    const campus_response = await this.campusDao.getByKeyAndValue(
      "name",
      campus_name
    );
    if (campus_response.statusCode !== 200) {
      throw Error(campus_response.message);
    }

    const campus_id = campus_response.object.id;

    const suggestion: Suggestion = {
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      content: suggestion_string,
      campus_id: campus_id,
    };

    const suggestion_response = await this.suggestionDao.create(suggestion);
    if (suggestion_response.statusCode !== 200) {
      throw Error(suggestion_response.message);
    }
  }

  public async emailSuggestionList(transporter) {
    transporter.verify(function (error, success) {
      if (error) {
        throw new Error(error);
      }
    });

    const campus_response = await this.campusDao.getAll();
    if (campus_response.statusCode !== 200) {
      throw Error(campus_response.message);
    }

    for (const campus of campus_response.object) {
      const suggestion_response =
        await this.suggestionDao.getSuggestionsByCampus(campus.id);

      if (suggestion_response.statusCode !== 200) {
        throw Error(suggestion_response.message);
      }

      const suggestions = suggestion_response.object;
      const suggestions_list = suggestions.reduce(
        (output, suggestion) => output + `<li>${suggestion.content}</li>`,
        ""
      );

      const mailOptions = {
        from: "bibliotrace@gmail.com",
        //TODO: add email field to campus and remove mine
        to: campus.email ?? "kellyko2003@gmail.com",
        subject: "Bibliotrace Suggestions",
        html: `<p>Suggestions: </p><ul>${suggestions_list}</ul>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          throw new Error(error);
        }
      });
    }
  }
}

export default SuggestionService;
