import AuditEntryDao from "../../src/db/dao/AuditEntryDao";
import BookDao from "../../src/db/dao/BookDao";
import CampusDao from "../../src/db/dao/CampusDao";
import CheckoutDao from "../../src/db/dao/CheckoutDao";
import DaoFactory from "../../src/db/dao/DaoFactory";
import InventoryDao from "../../src/db/dao/InventoryDao";
import RestockListDao from "../../src/db/dao/RestockListDao";
import ShoppingListDao from "../../src/db/dao/ShoppingListDao";
import { Book } from "../../src/db/schema/Book";
import { Campus } from "../../src/db/schema/Campus";
import { Checkout } from "../../src/db/schema/Checkout";
import { Inventory } from "../../src/db/schema/Inventory";
import { RestockList } from "../../src/db/schema/RestockList";
import SuccessResponse from "../../src/response/SuccessResponse";
import CheckoutService from "../../src/service/CheckoutService";
import {
  when,
  mock,
  verify,
  instance,
  anyString,
  anyOfClass,
  anything,
  reset,
  resetCalls,
} from "ts-mockito";

describe("Checkout service testing suite", () => {
  let qr_code: string;
  let location_id: number;
  let campus_name: string;
  let campus_obj: Campus;
  let inventory_obj: Inventory;
  let book_obj: Book;
  let checkout_obj: Checkout;

  let service;

  let mockedDaoFactory: DaoFactory;
  let mockedCampusDao: CampusDao;
  let mockedInventoryDao: InventoryDao;
  let mockedCheckoutDao: CheckoutDao;
  let mockedBookDao: BookDao;
  let mockedRestockListDao: RestockListDao;
  let mockedShoppingListDao: ShoppingListDao;
  let mockedAuditEntryDao: AuditEntryDao;

  beforeAll(() => {
    //test data
    qr_code = "ab1234";
    location_id = 1;
    campus_name = "lehi";
    campus_obj = { id: 1, campus_name: campus_name };
    inventory_obj = {
      qr: qr_code,
      book_id: 1,
      location_id: 1,
      campus_id: 1,
    };
    book_obj = {
      id: 1,
      book_title: "Harry Potter",
      author: "J.K. Rowling",
      primary_genre_id: 1,
      audience_id: 1,
    };
    checkout_obj = {
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      qr: qr_code,
      book_id: book_obj.id,
      state: "Out",
    };

    mockedDaoFactory = mock(DaoFactory);
    mockedCampusDao = mock(CampusDao);
    mockedInventoryDao = mock(InventoryDao);
    mockedCheckoutDao = mock(CheckoutDao);
    mockedBookDao = mock(BookDao);
    mockedRestockListDao = mock(RestockListDao);
    mockedShoppingListDao = mock(ShoppingListDao);
    mockedAuditEntryDao = mock(AuditEntryDao);

    when(mockedDaoFactory.getCampusDao()).thenReturn(instance(mockedCampusDao));
    when(mockedDaoFactory.getInventoryDao()).thenReturn(instance(mockedInventoryDao));
    when(mockedDaoFactory.getCheckoutDao()).thenReturn(instance(mockedCheckoutDao));
    when(mockedDaoFactory.getBookDao()).thenReturn(instance(mockedBookDao));
    when(mockedDaoFactory.getRestockListDao()).thenReturn(instance(mockedRestockListDao));
    when(mockedDaoFactory.getShoppingListDao()).thenReturn(instance(mockedShoppingListDao));
    when(mockedDaoFactory.getAuditEntryDao()).thenReturn(instance(mockedAuditEntryDao));

    service = new CheckoutService(instance(mockedDaoFactory));
  });

  afterEach(() => {
    reset(mockedDaoFactory);
    reset(mockedCampusDao);
    reset(mockedInventoryDao);
    reset(mockedCheckoutDao);
    reset(mockedBookDao);
    reset(mockedRestockListDao);
    reset(mockedShoppingListDao);
  });

  test("checkin success", async () => {
    when(mockedCampusDao.getByKeyAndValue("campus_name", campus_name)).thenResolve(
      new SuccessResponse<Campus>(`Campus retrieved successfully`, campus_obj)
    );

    when(mockedCheckoutDao.getByKeyAndValue("qr", qr_code)).thenResolve(
      new SuccessResponse(`Checkout retrieved successfully`, checkout_obj)
    );

    when(mockedCheckoutDao.checkin(qr_code)).thenResolve(
      new SuccessResponse(`Checkout deleted successfully`)
    );

    const inventory_obj: Inventory = {
      qr: qr_code,
      book_id: book_obj.id,
      location_id: location_id,
      campus_id: campus_obj.id,
    };

    when(mockedInventoryDao.create(anything())).thenResolve(
      new SuccessResponse<Inventory>(`Inventory created successfully`, inventory_obj)
    );

    when(mockedShoppingListDao.delete(book_obj.id)).thenResolve(
      new SuccessResponse(`No shopping item found with book_id ${book_obj.id} to delete`)
    );

    when(mockedBookDao.getByKeyAndValue("id", inventory_obj.book_id.toString())).thenResolve(
      new SuccessResponse<Book>(`Book retrieved successfully`, book_obj)
    );

    const response = await service.checkin(qr_code, location_id, campus_name);

    verify(mockedCampusDao.getByKeyAndValue("campus_name", campus_name)).once();
    verify(mockedCheckoutDao.getByKeyAndValue("qr", qr_code)).once();
    verify(mockedCheckoutDao.checkin(qr_code)).once();
    verify(mockedInventoryDao.create(anything())).once();
    verify(mockedShoppingListDao.delete(book_obj.id)).once();
    verify(mockedBookDao.getByKeyAndValue("id", inventory_obj.book_id.toString())).once();

    expect(response).toStrictEqual([
      new SuccessResponse<Inventory>(`Inventory created successfully`, inventory_obj),
      book_obj,
    ]);
  });

  test("checkout success", async () => {
    when(mockedCampusDao.getByKeyAndValue("campus_name", campus_name)).thenResolve(
      new SuccessResponse<Campus>(`Campus retrieved successfully`, campus_obj)
    );

    when(mockedInventoryDao.getByKeyAndValue("qr", qr_code)).thenResolve(
      new SuccessResponse<Inventory>(`Inventory retrieved successfully`, inventory_obj)
    );

    when(mockedCheckoutDao.create(anything())).thenResolve(
      new SuccessResponse(`Checkout created successfully`, checkout_obj)
    );
    when(mockedInventoryDao.checkout(qr_code, campus_obj.id)).thenResolve(
      new SuccessResponse(`${qr_code} checked out successfully`)
    );

    when(mockedBookDao.getByKeyAndValue("id", inventory_obj.book_id.toString())).thenResolve(
      new SuccessResponse<Book>(`Book retrieved successfully`, book_obj)
    );

    when(
      mockedInventoryDao.getAllByKeyAndValue("book_id", inventory_obj.book_id.toString())
    ).thenResolve(
      new SuccessResponse<Inventory[]>(`Inventory retrieved successfully`, [inventory_obj])
    );

    when(mockedAuditEntryDao.getAllByKeyAndValue("qr", qr_code)).thenResolve(
      new SuccessResponse(`Audit entry retrieved successfully`, [])
    );

    const restock_item: RestockList = {
      book_id: inventory_obj.book_id,
      title: book_obj.book_title,
      author: book_obj.author,
      campus_id: campus_obj.id,
      quantity: 1,
    };

    when(mockedRestockListDao.addRestockListItem(anything())).thenResolve(
      new SuccessResponse(`Restock item created successfully`, restock_item)
    );

    const response = await service.checkout(qr_code, campus_name);

    verify(mockedCampusDao.getByKeyAndValue("campus_name", campus_name)).once();
    verify(mockedInventoryDao.getByKeyAndValue("qr", qr_code)).once();
    verify(mockedCheckoutDao.create(anything())).once();
    verify(mockedInventoryDao.checkout(qr_code, campus_obj.id)).once();
    verify(mockedBookDao.getByKeyAndValue("id", inventory_obj.book_id.toString())).once();
    verify(
      mockedInventoryDao.getAllByKeyAndValue("book_id", inventory_obj.book_id.toString())
    ).once();
    verify(mockedRestockListDao.addRestockListItem(anything())).once();

    expect(response).toStrictEqual([
      new SuccessResponse(`Checkout created successfully`, checkout_obj),
      book_obj,
    ]);
  });
});
