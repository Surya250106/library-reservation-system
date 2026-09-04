import { Member } from "./Member";

/**
 * Represents a library book.
 * Acts as the Subject in the Observer Design Pattern.
 */
export class Book {
  /**
   * Tracks whether the book is currently reserved/borrowed.
   */
  public isReserved: boolean = false;

  /**
   * Reference to the member who currently holds the reservation.
   */
  public reservedBy: Member | null = null;

  /**
   * Internal list of members waitlisted for this book.
   * Serves as the list of Observers for this Subject.
   */
  private _waitlist: Member[] = [];

  /**
   * Creates an instance of a Book.
   *
   * @param title The title of the book.
   * @param author The author of the book.
   */
  constructor(
    public readonly title: string,
    public readonly author: string
  ) {}

  /**
   * Reserves the book for a specific member.
   *
   * @param member The member reserving the book.
   */
  public reserve(member: Member): void {
    this.isReserved = true;
    this.reservedBy = member;

    // Check if reservation is already added to the member's list
    const hasReservation = member.activeReservations.some(
      (r) => r.bookTitle === this.title
    );
    if (!hasReservation) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 14 days standard reserve period
      member.activeReservations.push({
        bookTitle: this.title,
        dueDate: dueDate,
      });
    }
  }

  /**
   * Returns the book.
   * If there are members in the waitlist, notifies all of them and automatically
   * assigns the reservation to the first member in the FIFO waitlist.
   */
  public returnBook(): void {
    if (!this.isReserved) {
      return;
    }

    // 1. Remove the book from the current borrower's active reservations
    const currentBorrower = this.reservedBy;
    if (currentBorrower) {
      currentBorrower.activeReservations = currentBorrower.activeReservations.filter(
        (res) => res.bookTitle !== this.title
      );
    }

    // 2. Mark the book as temporarily available
    this.isReserved = false;
    this.reservedBy = null;

    // 3. Notify every member currently on the waitlist
    this.notifyObservers();

    // 4. Select the first member in the FIFO waitlist
    const nextMember = this._waitlist.shift();

    if (nextMember) {
      // 5. & 6. & 7. Reserve the book for that member and add to their active reservations
      this.reserve(nextMember);
    }
  }

  /**
   * Adds a member to the FIFO waitlist.
   * Prevents duplicates from being added.
   *
   * @param member The member requesting the book.
   */
  public addToWaitlist(member: Member): void {
    if (!this._waitlist.includes(member)) {
      this._waitlist.push(member);
    }
  }

  /**
   * Removes a member from the waitlist.
   *
   * @param member The member to remove.
   */
  public removeFromWaitlist(member: Member): void {
    this._waitlist = this._waitlist.filter((m) => m !== member);
  }

  /**
   * Notifies all waitlisted members (observers) that the book is available.
   */
  public notifyObservers(): void {
    for (const member of this._waitlist) {
      member.update(this);
    }
  }

  /**
   * Exposes a safe copy of the waitlist to external callers to prevent direct mutation.
   *
   * @returns A copy of the waitlist array.
   */
  public getWaitlist(): Member[] {
    return [...this._waitlist];
  }
}
