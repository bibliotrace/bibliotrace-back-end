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
import { when, mock, verify, instance, anyString, anything, reset, anyNumber } from "ts-mockito";

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
      isbn_list: "9780439708180",
    };
    checkout_obj = {
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      qr: qr_code,
      book_id: book_obj.id,
      campus_id: 1,
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

    when(mockedInventoryDao.getBookByCampusAndQR(anyString(), anyNumber())).thenResolve(
      new SuccessResponse<Book>("Book retrieved successfully", book_obj)
    );

    when(mockedInventoryDao.getBookQuantity(book_obj.id, campus_obj.id)).thenResolve(
      new SuccessResponse<number>("Quantity retrieved successfully", 1)
    );
    when(mockedCheckoutDao.checkin(qr_code, campus_obj.id)).thenResolve(
      new SuccessResponse(`Checkout deleted successfully`)
    );

    when(mockedInventoryDao.updateCheckoutState(qr_code, campus_obj.id, false)).thenResolve(
      new SuccessResponse<Inventory>("Inventory updated successfully")
    );

    when(mockedShoppingListDao.deleteShoppingListItem(book_obj.id, campus_obj.id)).thenResolve(
      new SuccessResponse(`No shopping item found with book_id ${book_obj.id} to delete`)
    );

    when(mockedRestockListDao.addRestockListItem(anything())).thenResolve(
      new SuccessResponse<RestockList>("Success")
    );

    const response = await service.checkin(qr_code, campus_name);

    verify(mockedCampusDao.getByKeyAndValue("campus_name", campus_name)).once();
    verify(mockedInventoryDao.getBookByCampusAndQR(anything(), anything())).once();
    verify(mockedInventoryDao.getBookQuantity(anything(), anything())).once();
    verify(mockedCheckoutDao.checkin(qr_code, campus_obj.id)).once();
    verify(mockedInventoryDao.updateCheckoutState(qr_code, campus_obj.id, false)).once();
    verify(mockedShoppingListDao.deleteShoppingListItem(book_obj.id, campus_obj.id)).once();

    expect(response).toStrictEqual([
      new SuccessResponse<Inventory>(`Inventory updated successfully`, null),
      book_obj,
    ]);
  });

  test("checkout success", async () => {
    when(mockedCampusDao.getByKeyAndValue("campus_name", campus_name)).thenResolve(
      new SuccessResponse<Campus>(`Campus retrieved successfully`, campus_obj)
    );

    when(mockedInventoryDao.getBookByCampusAndQR(anyString(), anyNumber())).thenResolve(
      new SuccessResponse<Book>("Book retrieved successfully", book_obj)
    );

    when(mockedCheckoutDao.create(anything())).thenResolve(
      new SuccessResponse(`Checkout created successfully`, checkout_obj)
    );

    when(mockedInventoryDao.updateCheckoutState(qr_code, campus_obj.id, true)).thenResolve(
      new SuccessResponse<Inventory>("Inventory updated successfully")
    );

    when(mockedInventoryDao.getBookQuantity(book_obj.id, campus_obj.id)).thenResolve(
      new SuccessResponse<number>("Quantity retrieved successfully", 1)
    );

    when(mockedRestockListDao.addRestockListItem(anything())).thenResolve(
      new SuccessResponse<RestockList>("Success")
    );

    const response = await service.checkout(qr_code, campus_name);

    verify(mockedCampusDao.getByKeyAndValue("campus_name", campus_name)).once();
    verify(mockedInventoryDao.getBookByCampusAndQR(qr_code, campus_obj.id)).once();
    verify(mockedCheckoutDao.create(anything())).once();
    verify(mockedInventoryDao.getBookQuantity(book_obj.id, campus_obj.id)).once();
    verify(mockedRestockListDao.addRestockListItem(anything())).once();

    expect(response).toStrictEqual([
      new SuccessResponse(`Checkout created successfully`, checkout_obj),
      book_obj,
    ]);
  });
});
