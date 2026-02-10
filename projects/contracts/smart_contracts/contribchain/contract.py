from algopy import *
from algopy.arc4 import abimethod


class ContribChain(ARC4Contract):

    def __init__(self) -> None:
        """Initialize storage"""

        # Separate boxes for each field (Algopy safe)
        self.tasks = BoxMap(UInt64, String)
        self.hours = BoxMap(UInt64, UInt64)
        self.members = BoxMap(UInt64, Account)
        self.timestamps = BoxMap(UInt64, UInt64)

        self.counter = UInt64(0)

    @abimethod()
    def log_contribution(self, task: String, hours: UInt64) -> UInt64:
        """Store new contribution"""

        assert hours > 0, "Hours must be greater than zero"

        task_id = self.counter

        self.tasks[task_id] = task
        self.hours[task_id] = hours
        self.members[task_id] = Txn.sender
        self.timestamps[task_id] = Global.latest_timestamp

        self.counter += UInt64(1)

        return task_id

    @abimethod()
    def get_contribution(self, task_id: UInt64) -> String:
        """Return task description (simple test read)"""

        task, exists = self.tasks.maybe(task_id)
        assert exists, "Contribution not found"

        return task

    @abimethod()
    def total_entries(self) -> UInt64:
        return self.counter

