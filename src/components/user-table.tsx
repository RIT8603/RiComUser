import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { User } from "@/context/user-context";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>College/School</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length > 0 ? users.map((user, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phone}</TableCell>
            <TableCell>{user.school}</TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={4} className="text-center">No users have registered yet.</TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
