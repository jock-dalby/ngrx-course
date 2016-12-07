import {Application} from 'express';
import {Thread} from "../model/thread";
import {ThreadsVM} from "../view-model/threads.vm";
import * as _ from 'lodash';
import {dbThreads, dbParticipants, dbMessages} from "../db/db-data";
import {UserThreadSummaryVM} from "../view-model/user-thread-summary.vm";
import {Message} from "../model/message";
import {buildParticipantNames} from "../model/buildParticipantNames";


export function apiGetAllThreads(app: Application) {

    app.route('/api/threads-vm').get((req, res) => {

        const participantId = parseInt(req.cookies['PARTICIPANTID']);

        const threads: Thread[] = <any> _.values(dbThreads);

        const unreadThreads = _.reduce(threads,
            (acc, thread) => {
            if (thread.id === participantId) {
                acc++;
            }
            return acc;
        }, 0);

        const threadsVm: ThreadsVM = {
            unreadThreadsCounter: unreadThreads,
            threadSummaries: <any>threads.map(_.partial(mapThreadToThreadSummary, participantId))
        };

        res.status(200).json({payload: threadsVm});

    });

}


function mapThreadToThreadSummary(participantId:number, thread: Thread): UserThreadSummaryVM {

    const messages: Message[] =  <any>_.values(dbMessages);

    const messagesPerThread = _.chain(messages).filter(msg => msg.threadId == thread.id).orderBy(msg => msg.id).value();

    const lastMessage: Message = _.last(messagesPerThread);

    return {
        id: thread.id,
        participantNames: buildParticipantNames(thread),
        timestamp: lastMessage.timestamp,
        lastMessage: lastMessage.text,
        read: thread.readStatusByParticipant[participantId]
    };


}


