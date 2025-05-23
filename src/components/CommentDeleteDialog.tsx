import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "./ui/alert-dialog";
import { Trash } from "lucide-react";
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog";
import { Button } from "./ui/button";

type CommentDeleteDialogProps = {
    isDeleting: boolean,
    handleDelete: () => void,
}

export default function CommentDeleteDialog({isDeleting, handleDelete}: CommentDeleteDialogProps) {
    return (
        <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={'destructive'} size={'icon'}>
                  <Trash className='w-4 h-4' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the comment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
    )
} 