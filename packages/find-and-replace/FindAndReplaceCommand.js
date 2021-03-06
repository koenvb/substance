import Command from '../../ui/Command'

class FindAndReplaceCommand extends Command {
  getCommandState ({editorSession}) {
    let findAndReplaceManager = editorSession.getManager('find-and-replace')
    let findAndReplaceState = findAndReplaceManager.getCommandState()
    return findAndReplaceState
  }

  execute () {
    // Do nothing
  }
}

export default FindAndReplaceCommand
