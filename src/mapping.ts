import { ipfs, json, log } from "@graphprotocol/graph-ts"
import { CIDSent } from "../generated/IPFSEvent/IPFSEvent"
import { User } from "../generated/schema"

export function handleCID(event: CIDSent): void {

  let ipfsData = ipfs.cat(event.params.cid);

  // If the file cannot be retrieved over the IPFS network 
  // before the request times out, it will return null.
  if (!ipfsData) {
    return;
  }

  const jsonContent = json.fromBytes(ipfsData!);

  const object = jsonContent.toObject();

  const profileId = object.get('lens_profile_id');

  // `lens_profile_id` is in Number format. Direct conversion to String is not possible.
  // So, we convert it to BigInt first and then to String datatype.
  let userInstance = User.load(profileId.toBigInt().toString());

  if (!userInstance) {
    userInstance = new User(profileId.toBigInt().toString());

    userInstance.name = object.get('name').toString();
    userInstance.title = object.get('title').toString();
    userInstance.handle = object.get('handle').toString();
    userInstance.bio = object.get('bio').toString();
    userInstance.avatar = object.get('avatar').toString();
    userInstance.coverPicture = object.get('cover_picture').toString();
    userInstance.location = object.get('location').toString();
    userInstance.questionnaireId = object.get('questionnaire_id').toString();

    const social = object.get('social');
    if (social) {
      const socialData = social.toObject();
      userInstance.twitter = socialData.get('twitter').toString();
      userInstance.linkedIn = socialData.get('linkedin').toString();
      userInstance.github = socialData.get('github').toString();
      userInstance.facebook = socialData.get('facebook').toString();
    }

    userInstance.save();
  }

}

