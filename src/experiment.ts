import { Ucb } from "ucb";
import { Variant, BaseExperiment, IExperiment, IUserVariant } from "@bkknights/prosper";
import { UcbModel } from "./models/ucb-model";
import { ExperimentModel } from "./models/experiment-model";
import { UserVariantModel } from "./models/user-variant-model";
import { ExperimentLogModel, IExperimentLogDocument } from "./models/experiment-log-model";

export class Experiment extends BaseExperiment<Ucb> {
  constructor(
    public name: string,
    public variants: Variant[],
  ) {
    super();
  }

  public async  getExperiment(): Promise<IExperiment | null> {
    const experiment = await ExperimentModel.findOne({ name: this.name }).lean();
    if (!experiment) return null;
    this.id = experiment._id.toString();
    this.isEnabled = experiment.isEnabled;
    return experiment;
  }

  public async upsertExperiment(experimentSetRecord: IExperiment): Promise<IExperiment> {
    let experiment: IExperiment;
    if (this.id) {
      await ExperimentModel.updateOne({ ...experimentSetRecord, name: this.name, _id: this.id }).lean();
      experiment = await ExperimentModel.findOne({ name: this.name, _id: this.id }).lean();
    } else {
      experiment = await ExperimentModel.create({ ...experimentSetRecord, name: this.name });
      this.id = experiment.id.toString();
    }

    return experiment;
  }

  public async deleteExperiment(experimentSetRecord: IExperiment): Promise<void> {
    await ExperimentModel.deleteOne({ _id: experimentSetRecord.id }).lean();
  }

  public async getUserVariant(userId: string, experimentId: string): Promise<IUserVariant | null> {
    return (
      (
        await UserVariantModel.findOne({ userId, experimentId }).lean()
      ) ?? null
    );
  }

  public async upsertUserVariant(userVariant: IUserVariant): Promise<void> {
    if (userVariant && userVariant.id) {
      await UserVariantModel.updateOne(userVariant).lean();
    } else {
      await UserVariantModel.create({ ...userVariant, experimentId: this.id });
    }
  }

  public async deleteUserVariant(userExperimentSetRecord: IUserVariant): Promise<void> {
    await UserVariantModel.deleteOne({ _id: userExperimentSetRecord.id }).lean();
  }

  public async deleteUserVariants(): Promise<void> {
    if (this.id) {
      await UserVariantModel.deleteMany({ experimentId: this.id }).lean();
    }
  }

  public async getAlgorithm(): Promise<Ucb> {
    return new Ucb(
      await UcbModel.findOne({ experimentId: this.id }).lean() || {
        arms: this.variants.length,
      }
    );
  }

  public async upsertAlgorithm(algorithm: Ucb): Promise<void> {
    const serialized = await algorithm.serialize();
    const result = await UcbModel.findOne({ experimentId: this.id }).lean();
    if (result) {
      await UcbModel.updateOne({
        ...serialized,
        experimentId: this.id,
      }).lean();
    } else {
      await UcbModel.create({
        ...serialized,
        experimentId: this.id,
      });
    }
  }

  public async deleteAlgorithm(): Promise<void> {
    const result = await UcbModel.findOne({ experimentId: this.id }).lean();
    if (result) {
      await UcbModel.deleteOne(result);
    }
  }

  public async getVariantIndex(algorithm: Ucb): Promise<number> {
    return await algorithm.select();
    // return Math.random() * 3 | 0;
  }

  public async rewardAlgorithm(algorithm: Ucb, variantIndex: number, reward: number): Promise<Ucb> {
    return await algorithm.reward(variantIndex, reward);
  }

  public async enable(): Promise<void> {
    await super.enable();

    await ExperimentLogModel.create({
      experimentId: this.id,
      experimentName: this.name,
      enabledAt: new Date(),
    });
  }

  public async disable(): Promise<void> {
    await this.getExperiment();
    const { counts } = await this.getAlgorithm();
    await this.updateExperimentLog({
      variantCounts: counts.map((count: number, idx: number) => ({ variantName: this.variants[idx].name, count })),
      disabledAt: new Date(),
    });

    await super.disable();
  }

  private async updateExperimentLog(experimentLog: Partial<IExperimentLogDocument>): Promise<void> {
    const result = await ExperimentLogModel.findOne({ experimentId: this.id }).lean();
    if (result) {
      await ExperimentLogModel.updateOne({ _id: result._id }, {
        experimentId: this.id,
        ...({
          ...result,
          ...experimentLog
        }),
      });
    }
  }
}
