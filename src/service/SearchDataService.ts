import CampusDao from "../db/dao/CampusDao";
import GenreTypeDao from "../db/dao/GenreTypeDao";
import { Kysely } from "kysely";
import Database from "../db/schema/Database";
import { ResultRow } from "../handler/SearchRouteHandler";
import DaoFactory from "../db/dao/DaoFactory";

export default class SearchDataService {
  db: Kysely<Database>;
  campusDao: CampusDao;
  genreTypeDao: GenreTypeDao;

  constructor(db: Kysely<Database>, daoFactory: DaoFactory) {
    this.db = db;
    this.campusDao = daoFactory.getCampusDao();
    this.genreTypeDao = daoFactory.getGenreTypeDao();
  }

  async retrieveMetadata(
    filterQueryList: any[],
    isbn: string,
    campus: string
  ): Promise<ResultRow> {
    const splitIsbn = isbn.split("||");

    try {
      let dbQuery = this.db
        .selectFrom("books")
        .innerJoin("inventory", "inventory.book_id", "books.id")
        .leftJoin("genre_types", "books.primary_genre_id", "genre_types.id")
        .leftJoin("audiences", "audiences.id", "books.audience_id")
        .leftJoin("series", "series.id", "books.series_id")
        .leftJoin("campus", "campus.id", "inventory.campus_id")
        .select([
          "books.id",
          "books.book_title",
          "books.author",
          "genre_types.genre_name",
          "series.series_name",
        ])
        .where("campus.campus_name", "=", campus)
        .where("books.isbn_list", "like", `%${splitIsbn[0]}%`);

      if (filterQueryList.length > 0) {
        for (const filter of filterQueryList) {
          dbQuery = dbQuery.where(filter.key, "in", filter.value);
        }
      }

      const dbResult = await dbQuery.executeTakeFirst();

      if (dbResult != null) {
        const output = {
          id: String(dbResult.id),
          title: dbResult.book_title,
          author: dbResult.author ?? "Unknown",
          genre: dbResult.genre_name,
          series: dbResult.series_name ?? "None",
          isbn: splitIsbn[0],
          coverImageId: null,
        };
        if (splitIsbn.length > 1) {
          const coverUrl = splitIsbn[1];
          const chunksOfUrl = coverUrl.split("/");
          output.coverImageId = chunksOfUrl[chunksOfUrl.length - 1];
        }
        return output;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error trying to retrieve metadata for book: ${error.message}`);
    }
  }

  async retrieveAllISBNs(filterQueryList: any[], campus: string): Promise<string[]> {
    try {
      let dbQuery = this.db
        .selectFrom("books")
        .distinct()
        .select("isbn_list")
        .innerJoin("inventory", "inventory.book_id", "books.id")
        .leftJoin("genre_types", "books.primary_genre_id", "genre_types.id")
        .leftJoin("audiences", "audiences.id", "books.audience_id")
        .leftJoin("campus", "campus.id", "inventory.campus_id")
        .where("campus.campus_name", "=", campus);

      if (filterQueryList.length > 0) {
        for (const filter of filterQueryList) {
          dbQuery = dbQuery.where(filter.key, "in", filter.value);
        }
      }

      const dbResult = await dbQuery.execute();

      if (dbResult != null) {
        return dbResult.flatMap((input) => {
          const result = input.isbn_list;
          return result.split("|")[0];
        });
      } else {
        throw new Error("dbResult was null for some reason!");
      }
    } catch (error) {
      throw new Error(`Error trying to retreive all ISBN's: ${error.message}`);
    }
  }
}
