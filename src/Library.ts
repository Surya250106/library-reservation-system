import { Book } from "./Book";
import { Member, Reservation } from "./Member";
import { MemberFactory } from "./MemberFactory";

/**
 * Library class acting as the central facade for the book reservation system.
 */
export class Library {
  private books: Book[] = [];
  private members: Member[] = [];

  /**
   * Adds a new book to the library collection.
   *
   * @param title The title of the book.
   * @param author The author of the book.
   * @returns The created Book instance.
   */
  public addBook(title: string, author: string): Book {
    const book = new Book(title, author);
    this.books.push(book);
    return book;
  }

  /**
   * Registers a new member in the library. Uses MemberFactory.
   *
   * @param name The name of the member.
   * @param type The member type ("standard", "student", or "staff").
   * @returns The registered Member subclass instance.
   */
  public registerMember(name: string, type: string): Member {
    const member = MemberFactory.createMember(type, name);
    this.members.push(member);
    return member;
  }

  /**
   * Searches for a book by its title (case-insensitive).
   *
   * @param title The title of the book.
   * @returns The Book instance if found, otherwise undefined.
   */
  public findBook(title: string): Book | undefined {
    return this.books.find(
      (b) => b.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
  }

  /**
   * Searches for a member by their ID.
   *
   * @param id The unique identifier of the member.
   * @returns The Member instance if found, otherwise undefined.
   */
  public findMember(id: string): Member | undefined {
    return this.members.find((m) => m.id === id);
  }

  /**
   * Reserves a book for a member.
   *
   * @param memberId The ID of the member.
   * @param bookTitle The title of the book.
   * @throws Error if member or book does not exist, or if borrowing limit is reached.
   */
  public reserveBook(memberId: string, bookTitle: string): void {
    // 1. Verify that the member exists.
    const member = this.findMember(memberId);
    if (!member) {
      throw new Error(`Member with ID "${memberId}" not found.`);
    }

    // 2. Verify that the book exists.
    const book = this.findBook(bookTitle);
    if (!book) {
      throw new Error(`Book with title "${bookTitle}" not found.`);
    }

    // 3. Check whether the member has reached their borrowing limit.
    if (member.activeReservations.length >= member.borrowingLimit) {
      throw new Error("Reservation limit reached");
    }

    // 4. Reserve or add to waitlist
    if (!book.isReserved) {
      book.reserve(member);
    } else {
      book.addToWaitlist(member);
    }
  }

  /**
   * Processes the return of a book, updating its reservation state and waitlist.
   *
   * @param bookTitle The title of the book to return.
   * @throws Error if the book does not exist.
   */
  public returnBook(bookTitle: string): void {
    const book = this.findBook(bookTitle);
    if (!book) {
      throw new Error(`Book with title "${bookTitle}" not found.`);
    }
    book.returnBook();
  }

  /**
   * Calculates the fine for a reservation or the total fine for a member.
   *
   * Overload 1: Calculates fine for a single reservation.
   * Overload 2: Calculates total fine for all overdue reservations of a member.
   *
   * @param target Either a Reservation object or a member ID.
   * @param currentDate The date to calculate the fine against (defaults to now).
   * @returns The calculated fine amount (dollars).
   */
  public calculateFine(target: Reservation | string, currentDate: Date = new Date()): number {
    if (typeof target === "string") {
      const member = this.findMember(target);
      if (!member) {
        throw new Error(`Member with ID "${target}" not found.`);
      }
      return member.activeReservations.reduce(
        (sum, res) => sum + this.calculateSingleFine(res, currentDate),
        0
      );
    } else {
      return this.calculateSingleFine(target, currentDate);
    }
  }

  /**
   * Helper to calculate fine for a single reservation.
   */
  private calculateSingleFine(reservation: Reservation, currentDate: Date): number {
    const diffMs = currentDate.getTime() - reservation.dueDate.getTime();
    if (diffMs <= 0) {
      return 0;
    }
    // Calculate integer overdue days (avoiding floating point rounding issues)
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays * 0.50;
  }
}
